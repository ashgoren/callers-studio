# Caller Studio — Frontend

React 19 SPA for organizing contra dances & programs. Uses Material UI v7, Material React Table, and Supabase (PostgreSQL).

## Development

```bash
npm run dev       # Generate Supabase types + start Vite dev server with HMR
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint (v9 flat config)
npm run preview   # Preview production build locally
```

Supabase runs locally at `http://127.0.0.1:54321`. Credentials are in `.env.local`.

---

## Architecture Overview

```
Supabase → src/hooks/ → Components
```

- **`src/hooks/`** — TanStack Query v5 wrappers with Supabase calls inlined. Handle CRUD, caching, and invalidation. Primary models eager-load relations via `.select('*, relation(*)')`. Auxiliary tables use lightweight selects (junction IDs only for delete-guarding).
- **`src/components/{Entity}/config.tsx`** — Column definitions for Material React Table, default form values (`newRecord`), query builder config.
- **`TablePage`** — Generic wrapper connecting a data hook + column config to Material React Table. Used by primary models (Dances, Programs).
- **`src/components/{Entity}/{Entity}Page.tsx`** — Routing wrapper: loads record, manages view/edit toggle. Create mode handled via `id === 'new'`.
- **`src/components/{Entity}/{Entity}View.tsx`** — View mode with explicit JSX. Owns delete flow.
- **`src/components/{Entity}/{Entity}Edit.tsx`** — Edit/create form with explicit fields. Guards unsaved changes via `useBlocker` + `beforeunload`.
- **`src/components/Settings/`** — Hub page at `/settings` with inline-editable list components for auxiliary tables (choreographers, key moves, vibes, etc.).

---

## Developer Guides

### Adding a New Auxiliary Table (Settings List)

Auxiliary tables hold reference data linked to dances but not browsed independently — choreographers, key moves, vibes, etc. These live under `/settings` as simple inline-editable lists rather than full `TablePage` views. Use `choreographers` as the reference implementation.

#### 1. Database

Create the table and junction table in a migration and run it in Supabase locally & in production.
(Use `supabase/migrations/20260221200542_add_key_moves.sql` as a template.)

```bash
supabase migration up  # apply pending migrations locally
supabase db push       # apply pending migrations to production
```

#### 2. Custom Types — `src/lib/types/database.ts`

Regenerate TypeScript types:

```bash
npm run dev # or manually: supabase gen types typescript --local > src/lib/types/database_generated.ts
```

Then define the custom types. Include the junction array with `{ id: number }[]` if you want to disable deleting key moves that are linked to dances (delete-guarding). If delete-guarding isn't needed, `KeyMove = KeyMoveRow` is sufficient and the junction array can be omitted.

```typescript
export type Model = 'dance' | 'program' | 'choreographer' | 'key_move';

export type KeyMoveRow = Tables['key_moves']['Row'];
// If delete-guarding is needed (disable delete when linked to dances), include the junction count:
export type KeyMove = KeyMoveRow & { dances_key_moves: { id: number }[] };
// If no delete-guarding, KeyMove = KeyMoveRow is sufficient.
export type KeyMoveInsert = Tables['key_moves']['Insert'];
export type KeyMoveUpdate = Tables['key_moves']['Update'];
```

#### 3. Query Hook — `src/hooks/useKeyMoves.ts`

Supabase functions are module-level private functions in the same file. No single-record hook, no `select` transform:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotify } from '@/hooks/useNotify';
import { supabase } from '@/lib/supabase';
import type { KeyMove, KeyMoveInsert, KeyMoveUpdate } from '@/lib/types/database';

const getKeyMoves = async () => {
  const { data, error } = await supabase
    .from('key_moves')
    .select('*, dances_key_moves(id)')   // omit join entirely if no delete-guarding
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as KeyMove[];
};

const createKeyMove = async (item: KeyMoveInsert) => { ... };
const updateKeyMove = async (id: number, updates: KeyMoveUpdate) => { ... };
const deleteKeyMove = async (id: number) => { ... };

export const useKeyMoves = () =>
  useQuery({ queryKey: ['key_moves'], queryFn: getKeyMoves });

export const useCreateKeyMove = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: KeyMoveInsert) => createKeyMove(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['key_moves'] }),
    onError: (err: Error) => toastError(err.message),
  });
};

// useUpdateKeyMove, useDeleteKeyMove follow the same pattern
```

#### 4. Settings List Component — `src/components/Settings/KeyMovesList.tsx`

Copy the pattern from `ChoreographersList.tsx`. Key elements:

- `useTitle` to set the page title
- `useState` for `searchTerm`, `editingId` (`number | 'new' | null`), `editValue`
- Search `TextField` at top filters client-side via `.filter()`
- `List` of rows: normal mode shows name + edit/delete icon buttons; edit mode shows a `TextField` with save (Check) / cancel (Close) icons
- Delete disabled (with `Tooltip` explaining why) when `item.dances_key_moves.length > 0`
- Count shown as `(N)` with tooltip in view mode, hidden in edit mode
- Add button at bottom sets `editingId = 'new'`
- `handleSave` calls create or update; errors are already toasted by the hook

#### 5. Wire Up Settings Page — `src/components/Settings/SettingsPage.tsx`

Add to `SETTINGS_ITEMS`:

```typescript
{ label: 'Key Moves', description: 'Manage key move tags', path: '/settings/key-moves', icon: <MusicNoteIcon /> },
```

#### 6. Export — `src/components/Settings/index.ts`

```typescript
export * from './KeyMovesList';
```

#### 7. Add Route — `src/App.tsx`

```typescript
import { KeyMovesList } from './components/Settings';

// inside the ProtectedRoute children array:
{ path: '/settings/key-moves', element: <KeyMovesList /> },
```

No nav changes needed — already under `/settings`.

#### 8. Surface in Dance Table and Edit Form (if applicable)

If this auxiliary table should appear on dance records, follow the steps in [Adding a New Relation Between Tables](#adding-a-new-relation-between-tables) — specifically:

- Add the junction array to the `Dance` type in `src/lib/types/database.ts`
- Update the select string in `src/hooks/useDances.ts` to eager-load the relation
- Create mutation hooks in `src/hooks/useDances{Model}s.ts` with inlined Supabase add/remove functions
- Update `buildRelationsColumns` in `src/hooks/useDances.ts` with a computed name string (if users should filter by it)
- Add a column to `src/components/Dances/config.tsx` with `Cell` showing a plain text join
- Add `usePendingRelations`, the mutation hooks, and a `RelationEditor` to `DanceEdit.tsx`
- Add the display field to `DanceView.tsx`
- Add computed field to `queryFields` in `config.tsx` (if filtering needed)

---

### Adding a New Primary Model (Full Table + Detail Pages)

#### 1. Database

Create the table in Supabase and run a migration. Then regenerate TypeScript types:

```bash
supabase gen types typescript --local > src/lib/types/database_generated.ts
```

#### 2. Custom Types — `src/lib/types/database.ts`

Add the model name to `DrawerModel` (if it needs `RelationCell` clickable chips from other views) and define the types:

```typescript
export type DrawerModel = 'dance' | 'program' | 'venue'; // add if needed
export const MODEL_PATHS: Record<DrawerModel, string> = {
  dance: '/dances',
  program: '/programs',
  venue: '/venues', // add if needed
};

export type VenueRow = Tables['venues']['Row'];
export type Venue = VenueRow & {
  // add relation arrays here when relations exist
};
export type VenueInsert = Tables['venues']['Insert'];
export type VenueUpdate = Tables['venues']['Update'];
```

#### 3. Query Hook — `src/hooks/useVenues.ts`

Supabase functions are module-level private functions in the same file. Invalidate all affected query keys on mutation:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotify } from '@/hooks/useNotify';
import { supabase } from '@/lib/supabase';
import type { Venue, VenueInsert, VenueUpdate } from '@/lib/types/database';

const getVenues = async () => { ... };
const getVenue = async (id: number) => { ... };
const createVenue = async (venue: VenueInsert) => { ... };
const updateVenue = async (id: number, updates: VenueUpdate) => { ... };
const deleteVenue = async (id: number) => { ... };

export const useVenues = () =>
  useQuery({ queryKey: ['venues'], queryFn: getVenues });

export const useVenue = (id: number) =>
  useQuery({ queryKey: ['venue', id], queryFn: () => getVenue(id), enabled: !!id });

export const useCreateVenue = () => { ... };
export const useUpdateVenue = () => { ... };
export const useDeleteVenue = () => { ... };
```

#### 4. Config — `src/components/Venues/config.tsx`

```typescript
import type { MRT_ColumnDef } from 'material-react-table';
import type { Venue, VenueInsert } from '@/lib/types/database';

export const newRecord: VenueInsert = {
  name: '',
  location: '',
};

export const columns: MRT_ColumnDef<Venue>[] = [
  { accessorKey: 'name', header: 'Name', size: 250, meta: { inputType: 'text' } },
  { accessorKey: 'location', header: 'Location', size: 200, meta: { inputType: 'text' } },
];

export const tableInitialState = {
  sorting: [{ id: 'name', desc: false }],
  density: 'compact' as const,
  pagination: { pageSize: 100, pageIndex: 0 },
};

export const queryFields = [
  { name: 'name', label: 'Name', inputType: 'string' },
  { name: 'location', label: 'Location', inputType: 'string' },
];

export const defaultQuery = {
  combinator: 'and',
  rules: [{ field: 'name', operator: 'contains', value: '' }],
};
```

#### 5. Routing Wrapper — `src/components/Venues/VenuePage.tsx`

Loads the record and manages view/edit toggle. `id === 'new'` goes straight to edit mode.

```typescript
import { useState } from 'react';
import { useParams } from 'react-router';
import { Spinner, ErrorMessage } from '@/components/shared';
import { useVenue } from '@/hooks/useVenues';
import { VenueViewMode } from './VenueView';
import { VenueEditMode } from './VenueEdit';

export const VenuePage = () => {
  const { id } = useParams();
  if (id === 'new') return <VenueEditMode />;
  return <VenueDetailPage id={Number(id!)} />;
};

const VenueDetailPage = ({ id }: { id: number }) => {
  const { data: venue, isLoading, error } = useVenue(id);
  const [isEditing, setIsEditing] = useState(false);
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!venue) return <ErrorMessage error={new Error('Venue not found')} />;
  if (isEditing) return <VenueEditMode venue={venue} onCancel={() => setIsEditing(false)} />;
  return <VenueViewMode venue={venue} onEdit={() => setIsEditing(true)} />;
};
```

#### 6. View Component — `src/components/Venues/VenueView.tsx`

Explicit JSX for each field. Owns the delete flow (confirm → delete → pushAction undo → navigate to list).

Use `DanceView.tsx` as the reference implementation. Key elements:
- Back button → `navigate('/venues')`
- Edit + Delete buttons in the header
- `Field` label+value helper component for consistent layout
- `useTitle` for page title
- Delete pushes an undo action to `UndoContext` before navigating away

#### 7. Edit/Create Component — `src/components/Venues/VenueEdit.tsx`

Explicit form fields with unsaved-changes protection. Use `DanceEdit.tsx` as the reference implementation. Key patterns:

```typescript
const [isSaved, setIsSaved] = useState(false);
const blocker = useBlocker(!isSaved && (isDirty || hasPendingChanges));

// After save in create mode:
flushSync(() => setIsSaved(true)); // disable blocker before navigate fires
navigate(`/venues/${venueId}`);

// After cancel confirm in create mode:
flushSync(() => setIsSaved(true));
navigate('/venues');
```

#### 8. Table Component — `src/components/Venues/Venues.tsx`

```typescript
import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { TablePage } from '@/components/TablePage';
import { useVenues } from '@/hooks/useVenues';
import { columns, queryFields, defaultQuery, tableInitialState } from './config';
import type { Venue } from '@/lib/types/database';

export const Venues = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Venues'), [setTitle]);
  return (
    <TablePage<Venue>
      model='venue'
      useData={useVenues}
      columns={columns}
      queryFields={queryFields}
      defaultQuery={defaultQuery}
      tableInitialState={tableInitialState}
    />
  );
};
```

#### 9. Index File — `src/components/Venues/index.ts`

```typescript
export * from './VenuePage';
export * from './Venues';
```

#### 10. Add Routes — `src/App.tsx`

```typescript
import { Venues, VenuePage } from './components/Venues';

// inside the ProtectedRoute children array:
{ path: '/venues', element: <Venues /> },
{ path: '/venues/:id', element: <VenuePage /> },
```

The `:id` route handles both existing records (`/venues/42`) and create mode (`/venues/new`).

#### 11. Add Nav Link — `src/components/layouts/NavBar.tsx`

Add `/venues` to the nav links list.

---

### Adding a New Relation Between Tables

Use the `dances ↔ choreographers` relation as a reference.

#### 1. Database

Create a join table (e.g., `dances_venues`) with foreign keys to both tables. Run the migration and regenerate types:

```bash
supabase gen types typescript --local > src/lib/types/database_generated.ts
```

#### 2. Update the Custom Types — `src/lib/types/database.ts`

Add the join array to each side of the relation:

```typescript
export type Dance = DanceRow & {
  // ...existing relations...
  dances_venues: { id: number; venue: VenueRow }[],  // add here
};

export type Venue = VenueRow & {
  dances_venues: { id: number; dance: DanceRow }[],  // add here
};
```

#### 3. Update the Select String

In `src/hooks/useDances.ts`, update every select string constant to include the new join:

```typescript
.select('*, programs_dances(...), dances_choreographers(...), dances_venues(id, venue:venues(*))')
```

Do the same in `src/hooks/useVenues.ts` if you want dances eager-loaded from the venue side.

#### 4. Mutation Hooks — `src/hooks/useDancesVenues.ts`

Supabase add/remove functions are module-level privates in the same file:

```typescript
const addVenueToDance = async (danceId: number, venueId: number) => { ... };
const removeVenueFromDance = async (danceId: number, venueId: number) => { ... };

export const useAddVenueToDance = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, venueId }: { danceId: number; venueId: number }) =>
      addVenueToDance(danceId, venueId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err: Error) => toastError(err.message),
  });
};
// useRemoveVenueFromDance follows the same pattern
```

#### 5. Update the Hook's `select` Transform (if needed)

In `src/hooks/useDances.ts`, if you need a flattened string for query builder filtering, add it to the `buildRelationsColumns` helper:

```typescript
const buildRelationsColumns = (dance: Dance) => ({
  ...dance,
  // existing...
  venueNames: (dance.dances_venues ?? []).map(dv => dv.venue.name).join(', '),
});
```

#### 6. Add a Column in the Config — `src/components/Dances/config.tsx`

For table display. For auxiliary-table relations, use a plain text join. For primary-model relations (entities in `MODEL_PATHS`), use `RelationCell` with clickable chips:

```typescript
{
  id: 'venues',
  header: '🔗 Venues',
  enableColumnFilter: false,
  size: 200,
  Cell: ({ row }) => (
    <RelationCell
      items={row.original.dances_venues}
      model='venue'
      getId={(joinRow) => joinRow.venue.id}
      getLabel={(joinRow) => joinRow.venue.name}
    />
  ),
  meta: { inputType: 'relation' },
},
```

#### 7. Add Relation Display to `DanceView.tsx`

Add the field explicitly in the view JSX:

```typescript
<Field label='Venues'>
  <RelationCell
    items={dance.dances_venues}
    model='venue'
    getId={dv => dv.venue.id}
    getLabel={dv => dv.venue.name}
  />
</Field>
```

#### 8. Add Relation Editing to `DanceEdit.tsx`

Use `usePendingRelations` to stage add/remove before save, and add a `RelationEditor` in the form JSX:

```typescript
const pendingVenues = usePendingRelations();
const { mutateAsync: addVenue } = useAddVenueToDance();
const { mutateAsync: removeVenue } = useRemoveVenueFromDance();

// In handleSave:
const { added: addedVenues, removed: removedVenues } = await pendingVenues.commitChanges(
  (venueId) => addVenue({ danceId, venueId }),
  (venueId) => removeVenue({ danceId, venueId }),
);

// In JSX:
<RelationEditor
  model='venue' label='Venues'
  relations={dance?.dances_venues ?? []}
  getRelationId={(dv) => dv.venue.id}
  getRelationLabel={(dv) => dv.venue.name}
  options={venues ?? []}
  getOptionId={(venue) => venue.id}
  getOptionLabel={(venue) => venue.name}
  pending={pendingVenues}
/>
```

Also update `hasPendingChanges` to include `pendingVenues.hasPendingChanges`, and include the undo ops in `pushAction`.

#### 9. Add to Query Builder Fields (if applicable)

In `config.tsx`, add a field using the computed name string from step 5:

```typescript
export const queryFields = [
  // existing...
  { name: 'venueNames', label: 'Venues', inputType: 'string' },
];
```

---

### Adding a New Shared Lookup Table (FK on Dance)

Shared lookup tables hold a fixed, globally-shared list of options — dance types, formations, progressions, etc. Unlike auxiliary tables, they have no `user_id` (all users see the same list), are managed via migrations rather than a settings page, and are linked to dances via a nullable FK column rather than a junction table.

Use `dance_types` / `formations` / `progressions` as reference implementations.

#### 1. Database

Create a migration with:
- The lookup table (`id`, `name`, `sort_order`) — no `user_id`
- Seed rows in the desired display order
- A nullable FK column on `dances` with `on delete set null`
- RLS: select-only for authenticated users — use `(select auth.role())` not `auth.role()` to avoid per-row re-evaluation

```sql
create table "public"."formations" (
  "id" bigint generated by default as identity not null,
  "name" text not null,
  "sort_order" integer not null
);

alter table "public"."formations" enable row level security;

CREATE UNIQUE INDEX formations_pkey ON public.formations USING btree (id);
CREATE UNIQUE INDEX formations_name_key ON public.formations USING btree (name);
alter table "public"."formations" add constraint "formations_pkey" PRIMARY KEY using index "formations_pkey";
alter table "public"."formations" add constraint "formations_name_key" UNIQUE using index "formations_name_key";

insert into "public"."formations" (name, sort_order) values
  ('Improper', 1), ('Becket', 2), ('Proper', 3), ('Other', 4);

alter table "public"."dances"
  add column "formation_id" bigint references public.formations(id) on delete set null;

CREATE INDEX ON public.dances (formation_id);

grant select on table "public"."formations" to "anon";
grant select on table "public"."formations" to "authenticated";
grant select on table "public"."formations" to "postgres";
grant select on table "public"."formations" to "service_role";

create policy "authenticated_read" on "public"."formations"
  as permissive for select using ((select auth.role()) = 'authenticated');
```

#### 2. Custom Types — `src/lib/types/database.ts`

Add a `*Row` type (no Insert/Update/junction needed — these are read-only from the app):

```typescript
export type FormationRow = Tables['formations']['Row'];
```

Extend `Dance` with the nullable joined object:

```typescript
export type Dance = DanceRow & {
  // ...existing relations...
  formation: FormationRow | null,
};
```

#### 3. Query Hook — `src/hooks/useFormations.ts`

Read-only, no mutations. Supabase function inlined as a module-level private:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { FormationRow } from '@/lib/types/database';

const getFormations = async () => {
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data as FormationRow[];
};

export const useFormations = () =>
  useQuery({ queryKey: ['formations'], queryFn: getFormations });
```

#### 4. Update the Dances Select — `src/hooks/useDances.ts`

Add the FK join to the select string constant:

```typescript
const DANCE_SELECT = '*, ..., formation:formations(id, name, sort_order)';
```

#### 5. Update `config.tsx`

Add `formation_id: null` to `newRecord`. Add a column for the table:

```typescript
export const newRecord: DanceInsert = {
  // ...
  formation_id: null,
};

// In columns (table display only):
{
  accessorKey: 'formation_id',
  header: 'Formation',
  Cell: ({ row }) => (row.original as Dance).formation?.name ?? '',
  enableColumnFilter: false,
  size: 150,
  meta: { inputType: 'select' },
},
```

Add to `queryFields` — the query evaluator automatically resolves FK objects with a `.name` property:

```typescript
{ name: 'formation', label: 'Formation', inputType: 'string' },
```

#### 6. Add to `DanceView.tsx`

Add the field explicitly:

```typescript
<Field label='Formation'>{dance.formation?.name}</Field>
```

#### 7. Add to `DanceEdit.tsx`

Import the hook, add an `Autocomplete` field in the form JSX:

```typescript
const { data: formations } = useFormations();

// In JSX:
<Autocomplete
  options={formations ?? []}
  value={(formations ?? []).find(f => f.id === formData.formation_id) ?? null}
  getOptionLabel={f => f.name}
  onChange={(_, value) => update('formation_id', value?.id ?? null)}
  renderInput={(params) => <TextField {...params} label='Formation' />}
/>
```

Also add `formation_id` to `initialFormData`.

No settings page, no routing changes, no realtime sync changes needed.

---

### Adding a New Field to an Existing Model

1. **Write and apply a Supabase migration:**
   ```sql
   ALTER TABLE dances ADD COLUMN duration INTEGER;
   ```

2. **Regenerate types:**
   ```bash
   supabase gen types typescript --local > src/lib/types/database_generated.ts
   ```
   `DanceRow`, `DanceInsert`, and `DanceUpdate` automatically pick up the new column — no manual edits needed in `database.ts`.

3. **Add to `newRecord`** in `config.tsx`:
   ```typescript
   export const newRecord: DanceInsert = {
     // existing...
     duration: null,
   };
   ```

4. **Add a column to `config.tsx`** for the table:
   ```typescript
   {
     accessorKey: 'duration',
     header: 'Duration (min)',
     size: 150,
     meta: { inputType: 'number' },
   }
   ```

5. **Add to `DanceView.tsx`** for the detail view:
   ```typescript
   <Field label='Duration'>{dance.duration?.toString()}</Field>
   ```

6. **Add to `DanceEdit.tsx`** for the edit form — add the field to `initialFormData`, add a `TextField` in the JSX, and update the `formData` type annotation if needed:
   ```typescript
   // In initialFormData:
   duration: dance?.duration ?? newRecord.duration,

   // In JSX:
   <TextField
     label='Duration (min)'
     type='number'
     value={formData.duration ?? ''}
     onChange={e => update('duration', e.target.value ? Number(e.target.value) : null)}
     fullWidth
   />
   ```

7. **Add to `queryFields`** if users should filter by it:
   ```typescript
   { name: 'duration', label: 'Duration', inputType: 'number' },
   ```

---

### Adding a Computed Field for Query Builder Filtering

The query evaluator (`src/components/QueryBuilder/queryEvaluator.ts`) resolves field values from the dance row before applying filter operators. It has two resolution strategies:

**Automatic — FK lookup objects with a `.name` property:**
Fields like `formation`, `dance_type`, `progression` resolve automatically. `row['formation']` returns `{ id, name, sort_order }`, and the evaluator extracts `.name`. No evaluator changes needed when adding a new FK lookup field — just add it to `queryFields` using the relation alias name (e.g. `'formation'`, not `'formation_id'`).

**Also automatic — junction-table computed name strings:**
Fields like `choreographerNames`, `keyMoveNames` are flat strings added directly to the row by `buildRelationsColumns` in `src/hooks/useDances.ts`. Because `useDances` applies that transform before the data reaches `useTable`, `row['choreographerNames']` is already a plain string when the evaluator runs — no evaluator changes are needed. The only requirement is that the name used in `buildRelationsColumns` matches the `name` used in `queryFields`:

```typescript
// In useDances.ts buildRelationsColumns:
choreographerNames: sortedChoreographers.map(dc => dc.choreographer.name).join(', ')

// In config.tsx queryFields — must use the same string:
{ name: 'choreographerNames', label: 'Choreographers', inputType: 'string' },
```

---

## Key Files Reference

| Concern | File |
|---|---|
| Routing + providers | `src/App.tsx` |
| Page title sync | `src/contexts/TitleContext.tsx` |
| Undo/redo | `src/contexts/UndoContext.tsx` |
| Custom types + MODEL_PATHS | `src/lib/types/database.ts` |
| Auto-generated types (don't edit) | `src/lib/types/database_generated.ts` |
| Supabase client | `src/lib/supabase.ts` |
| TanStack Query client | `src/lib/react-query.ts` |
| Hook: Pending relation staging | `src/hooks/usePendingRelations.ts` |
| Hook: Table state + client filtering | `src/hooks/useTable.ts` |
| Hook: localStorage persistence | `src/hooks/usePersistence.ts` |
| Hook: Toast notifications | `src/hooks/useNotify.tsx` |
| Hook: Realtime sync | `src/hooks/useRealtimeSync.ts` |
| Generic table page | `src/components/TablePage.tsx` |
| Relation edit UI | `src/components/RelationEditor.tsx` |
| Relation display (table + view) | `src/components/RelationCell.tsx` |
| Query builder evaluator | `src/components/QueryBuilder/queryEvaluator.ts` |
| Dance routing wrapper | `src/components/Dances/DancePage.tsx` |
| Dance view mode | `src/components/Dances/DanceView.tsx` |
| Dance edit/create form | `src/components/Dances/DanceEdit.tsx` |
| Dance table config | `src/components/Dances/config.tsx` |
| Program routing wrapper | `src/components/Programs/ProgramPage.tsx` |
| Program view mode | `src/components/Programs/ProgramView.tsx` |
| Program edit/create form | `src/components/Programs/ProgramEdit.tsx` |
| Program table config | `src/components/Programs/config.tsx` |
| Settings hub | `src/components/Settings/SettingsPage.tsx` |
| Choreographers list | `src/components/Settings/ChoreographersList.tsx` |

---

## Checklist: New Shared Lookup Table (FK on Dance)

- [ ] Supabase migration created and applied (table with `id`, `name`, `sort_order`; seed rows; FK column on `dances`; select-only RLS using `(select auth.role())`)
- [ ] Types regenerated
- [ ] `*Row` type added to `src/lib/types/database.ts`
- [ ] `Dance` type extended with nullable joined object (e.g. `formation: FormationRow | null`)
- [ ] Read-only query hook created in `src/hooks/use{Model}s.ts` with inlined Supabase function (no mutations)
- [ ] Select string constant in `src/hooks/useDances.ts` updated to include the FK join
- [ ] `{model}_id: null` added to `newRecord` in `config.tsx`
- [ ] Column added to `config.tsx` for table display (with `Cell` renderer showing `.name`)
- [ ] Field added to `queryFields` in `config.tsx` using the relation alias name (not the `_id` column name)
- [ ] Field added to `DanceView.tsx`
- [ ] `Autocomplete` added to `DanceEdit.tsx` (hook imported, `initialFormData` updated, JSX added)

## Checklist: New Auxiliary Table (Settings List)

- [ ] Supabase migration created and applied
- [ ] `supabase gen types typescript --local > src/lib/types/database_generated.ts`
- [ ] `Model` union updated in `src/lib/types/database.ts`
- [ ] Custom types (`*Row`, `*`, `*Insert`, `*Update`) added to `database.ts` (junction array with `{ id: number }[]` if delete-guarding)
- [ ] TanStack Query hooks created in `src/hooks/use{Model}s.ts` with inlined Supabase functions (list + mutation hooks, no single-record hook)
- [ ] Settings list component created in `src/components/Settings/{Model}sList.tsx` (see `ChoreographersList.tsx` as reference)
- [ ] Exported from `src/components/Settings/index.ts`
- [ ] Entry added to `SETTINGS_ITEMS` in `src/components/Settings/SettingsPage.tsx`
- [ ] Route added in `src/App.tsx` under `/settings/{model}s`

**If surfacing in dances (table column + detail view):**
- [ ] Junction array added to `Dance` type in `src/lib/types/database.ts`
- [ ] Select string in `src/hooks/useDances.ts` updated to eager-load relation
- [ ] Mutation hooks created in `src/hooks/useDances{Model}s.ts` with inlined Supabase add/remove functions
- [ ] `buildRelationsColumns` in `src/hooks/useDances.ts` updated with computed name string (if filtering needed) — name must match the `queryFields` entry below
- [ ] Column added to `src/components/Dances/config.tsx` with plain text join `Cell` and `meta: { inputType: 'relation' }`
- [ ] Field display added to `DanceView.tsx`
- [ ] `usePendingRelations`, mutation hooks, and `RelationEditor` added to `DanceEdit.tsx`; `hasPendingChanges` and undo ops updated
- [ ] Computed field added to `queryFields` in `config.tsx` (if filtering needed)

## Checklist: New Primary Model (Full Table + Detail Pages)

- [ ] Supabase migration created and applied
- [ ] `supabase gen types typescript --local > src/lib/types/database_generated.ts`
- [ ] `DrawerModel` and `MODEL_PATHS` updated in `src/lib/types/database.ts` (if `RelationCell` links needed)
- [ ] Custom types (`*Row`, `*`, `*Insert`, `*Update`) added to `database.ts`
- [ ] TanStack Query hooks created in `src/hooks/use{Model}s.ts` with inlined Supabase functions (list + single-record + mutations)
- [ ] `config.tsx` created with `newRecord`, `columns`, `tableInitialState`, `queryFields`, `defaultQuery`
- [ ] `{Model}Page.tsx` created (routing wrapper + view/edit toggle)
- [ ] `{Model}View.tsx` created (explicit JSX view, delete flow, undo op)
- [ ] `{Model}Edit.tsx` created (explicit form, `useBlocker` + `beforeunload`, `flushSync` + `isSaved` pattern)
- [ ] `{Model}s.tsx` table component created
- [ ] `index.ts` created exporting `{Model}Page` and `{Model}s`
- [ ] Routes added in `src/App.tsx`: `/{model}s` and `/{model}s/:id`
- [ ] Nav link added in `src/components/layouts/NavBar.tsx`

## Checklist: New Relation

- [ ] Join table migration created and applied
- [ ] Types regenerated
- [ ] Join arrays added to both sides in `src/lib/types/database.ts`
- [ ] `.select()` strings updated in both entity API files
- [ ] Mutation hooks created for add/remove in `src/hooks/use{Model}s{Entity}s.ts` with inlined Supabase functions
- [ ] Hook `select` transform updated with computed name string (if filtering by name is needed) — name must match the `queryFields` entry below
- [ ] Column added to `config.tsx` for table display (`RelationCell` for primary-model relations; plain text join for auxiliary-table relations)
- [ ] Field added to `*View.tsx` for detail view display
- [ ] `usePendingRelations`, mutation hooks, and `RelationEditor` (or custom editor) added to `*Edit.tsx`; `hasPendingChanges` and undo ops updated
- [ ] `queryFields` updated with computed name field (if applicable)
- [ ] Query invalidations in mutation hooks cover all affected query keys
