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
- **`src/components/{Entity}/config.tsx`** — Column definitions, default form values, query builder config (primary models only).
- **`TablePage`** — Generic wrapper connecting a data hook + column config to Material React Table. Used by primary models (Dances, Programs).
- **`RecordDrawer`** — Right-side drawer for view/edit/create. Managed by `DrawerContext`.
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

// inside <ProtectedRoute>:
<Route path='/settings/key-moves' element={<KeyMovesList />} />
```

No nav changes needed — already under `/settings`.

#### 8. Surface in Dance Table and Drawer (if applicable)

If this auxiliary table should appear on dance records, follow the steps in [Adding a New Relation Between Tables](#adding-a-new-relation-between-tables) — specifically:

- Add the junction array to the `Dance` type in `src/lib/types/database.ts`
- Update the select string in `src/hooks/useDances.ts` to eager-load the relation
- Create mutation hooks in `src/hooks/useDances{Model}s.ts` with inlined Supabase add/remove functions
- Update `buildRelationsColumns` in `src/hooks/useDances.ts` with a computed name string (if users should filter by it)
- Add a `RelationCell` column to `src/components/Dances/config.tsx`
- Add `RelationEditor` to the `relationEditors` prop in `src/components/Dances/Dance.tsx` (view mode is automatic via `RecordView`)
- Add computed field to `queryFields` in `config.tsx` (if filtering needed)

---

### Adding a New Primary Model (Full Table + Drawer)

#### 1. Database

Create the table in Supabase and run a migration. Then regenerate TypeScript types:

```bash
supabase gen types typescript --local > src/lib/types/database_generated.ts
```

#### 2. Custom Types — `src/lib/types/database.ts`

Add the model name to the `Model` union and define the types:

```typescript
export type Model = 'dance' | 'program' | 'choreographer' | 'venue'; // add here

export type VenueRow = Tables['venues']['Row'];
export type Venue = VenueRow & {
  // add relation arrays here when relations exist
};
export type VenueInsert = Tables['venues']['Insert'];
export type VenueUpdate = Tables['venues']['Update'];
```

`*Row` is the bare DB row. `*` extends it with relation arrays. `*Insert`/`*Update` come directly from the generated types.

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

export const useCreateVenue = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venue: VenueInsert) => createVenue(venue),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['venues'] }),
    onError: (err: Error) => toastError(err.message),
  });
};

// useUpdateVenue, useDeleteVenue follow the same pattern
```

#### 4. Config — `src/components/Venues/config.tsx`

See [Adding Fields to a Config](#adding-fields-to-a-config) below for full details on column definitions.

```typescript
import type { MRT_ColumnDef } from 'material-react-table';
import type { Venue, VenueInsert } from '@/lib/types/database';

export const newRecord: VenueInsert = {
  name: '',
  location: '',
};

export const columns: MRT_ColumnDef<Venue>[] = [
  { accessorKey: 'name', header: 'Name', size: 250 },
  { accessorKey: 'location', header: 'Location', size: 200 },
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

#### 5. Detail Component — `src/components/Venues/Venue.tsx`

Orchestrates view/edit/create for one record:

```typescript
import { useDrawerState, useDrawerActions } from '@/contexts/DrawerContext';
import { RecordEdit } from '@/components/RecordEdit';
import { RecordView } from '@/components/RecordView';
import { useVenue, useCreateVenue, useUpdateVenue, useDeleteVenue } from '@/hooks/useVenues';
import { columns, newRecord } from './config';

export const Venue = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { closeDrawer } = useDrawerActions();
  const { data: venue, isLoading } = useVenue(Number(id));
  const { mutateAsync: create } = useCreateVenue();
  const { mutateAsync: update } = useUpdateVenue();
  const { mutateAsync: remove } = useDeleteVenue();

  const handleSave = async (updates: any) => {
    if (mode === 'create') {
      await create(updates);
    } else {
      await update({ id: venue!.id, updates });
    }
  };

  const handleDelete = async () => {
    await remove({ id: venue!.id });
    closeDrawer();
  };

  if (mode === 'create') {
    return <RecordEdit data={newRecord} columns={columns} onSave={handleSave} hasPendingRelationChanges={false} />;
  }

  if (isLoading || !venue) return null;

  if (mode === 'edit') {
    return <RecordEdit data={venue} columns={columns} onSave={handleSave} hasPendingRelationChanges={false} />;
  }

  return <RecordView data={venue} columns={columns} onDelete={handleDelete} />;
};
```

#### 6. Table Component — `src/components/Venues/Venues.tsx`

```typescript
import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { TablePage } from '@/components/TablePage';
import { useVenues } from '@/hooks/useVenues';
import { columns, queryFields, defaultQuery, tableInitialState } from './config';

export const Venues = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Venues'), [setTitle]);
  return (
    <TablePage
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

#### 7. Index File — `src/components/Venues/index.ts`

```typescript
export * from './Venue';
export * from './Venues';
export * from './config';
```

#### 8. Wire Up the Drawer — `src/components/RecordDrawer.tsx`

Add the component to the `DETAIL_COMPONENTS` map:

```typescript
import { Venue } from './Venues/Venue';

const DETAIL_COMPONENTS: Record<string, React.ComponentType<{ id?: number }>> = {
  dance: Dance,
  program: Program,
  venue: Venue, // add this
};
```

#### 9. Add a Route — `src/App.tsx`

```typescript
import { Venues } from './components/Venues';

// inside <Routes>:
<Route path='/venues' element={<Venues />} />
```

#### 10. Add Nav Link — `src/components/layouts/NavBar.tsx`

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
  programs_dances: { id: number; order: number; program: ProgramRow }[],
  dances_choreographers: { id: number; choreographer: ChoreographerRow }[],
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

In `src/hooks/useDances.ts`, if need a flattened string for query builder filtering, add it to the `buildRelationsColumns` helper:

```typescript
const buildRelationsColumns = (dance: Dance) => ({
  ...dance,
  // existing...
  venueNames: (dance.dances_venues ?? []).map(dv => dv.venue.name).join(', '),
});
```

#### 6. Add a Relation Column in the Config — `src/components/Dances/config.tsx`

Add the column with `meta: { inputType: 'relation' }`. This tells `RecordEdit` to slot in the matching editor from the `relationEditors` prop, and tells `RecordView` to render it via the `Cell` function (which uses `RelationCell` for clickable drawer navigation).

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

#### 7. Add Relation Editing to the Detail Component — `src/components/Dances/Dance.tsx`

Use `usePendingRelations` to stage add/remove before save. Pass `RelationEditor` via the `relationEditors` prop on `RecordEdit`, keyed by the column's `id`. No changes needed for view mode — `RecordView` automatically uses the column's `Cell` renderer.

```typescript
const pendingVenues = usePendingRelations();
const { mutateAsync: addVenue } = useAddVenueToDance();
const { mutateAsync: removeVenue } = useRemoveVenueFromDance();

const handleSave = async (updates: DanceUpdate) => {
  const { id: danceId } = mode === 'create'
    ? await createDance(updates as DanceInsert)
    : await updateDance({ id: dance!.id, updates });

  await pendingVenues.commitChanges(
    (venueId) => addVenue({ danceId, venueId }),
    (venueId) => removeVenue({ danceId, venueId }),
  );
};

<RecordEdit
  ...
  hasPendingRelationChanges={pendingVenues.hasPendingChanges}
  relationEditors={{
    venues: <RelationEditor
      model='venue' label='Venues'
      relations={dance?.dances_venues ?? []}
      getRelationId={(dv) => dv.venue.id}
      getRelationLabel={(dv) => dv.venue.name}
      options={venues ?? []}
      getOptionId={(venue) => venue.id}
      getOptionLabel={(venue) => venue.name}
      pending={pendingVenues}
    />,
  }}
/>
```

#### 8. Add to Query Builder Fields (if applicable)

In `config.tsx`, add a field using the computed name string from step 6:

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

Add `formation_id: null` to `newRecord`. Add a column with `accessorKey` (so RecordEdit includes it in form submission), a `Cell` renderer showing the name, and `meta: { inputType: 'select' }`:

```typescript
export const newRecord: DanceInsert = {
  // ...
  formation_id: null,
};

// In columns:
{
  accessorKey: 'formation_id',
  header: 'Formation',
  Cell: ({ row }) => (row.original as Dance).formation?.name ?? '',
  enableColumnFilter: false,
  size: 150,
  meta: { inputType: 'select' },
},
```

Add to `queryFields` — the query evaluator automatically resolves FK objects with a `.name` property, so no additional evaluator changes are needed:

```typescript
{ name: 'formation', label: 'Formation', inputType: 'string' },
```

#### 6. Wire Up in `Dance.tsx`

Import the hook, build the `selectOptions` map, and pass it to both `RecordEdit` instances:

```typescript
const { data: formations } = useFormations();

const selectOptions = {
  // ...existing entries...
  formation_id: (formations ?? []).map(f => ({ value: f.id, label: f.name })),
};

// Pass to RecordEdit:
<RecordEdit ... selectOptions={selectOptions}>
```

No settings page, no routing changes, no realtime sync changes needed.

---

### Adding Fields to a Config

The `config.tsx` file controls how fields appear in the table, detail view, and edit form.

#### Editable Field (persisted to DB)

Use `accessorKey` matching the DB column name. Always set `meta.inputType` explicitly — `RecordEdit` uses it to choose the input widget.

```typescript
{
  accessorKey: 'duration',
  header: 'Duration (min)',
  size: 150,
  meta: { inputType: 'number' },  // 'boolean' | 'number' | 'date' | 'text' | 'select' | 'relation'
}
```

For `'select'`, pass an options map to `RecordEdit` via the `selectOptions` prop (keyed by `accessorKey`). The Autocomplete is populated from there. See [Adding a New Shared Lookup Table](#adding-a-new-shared-lookup-table-fk-on-dance).

Also add the field to `newRecord`:

```typescript
export const newRecord: DanceInsert = {
  // existing fields...
  duration: null,
};
```

#### Relation Column (many-to-many, edit via `RelationEditor`)

Use `id` (no `accessorKey`) and set `meta: { inputType: 'relation' }`. In the table and drawer view, the `Cell` renderer handles display. In the edit form, `RecordEdit` looks up the matching editor from the `relationEditors` prop by column id. If no editor is provided for that id, the column is silently skipped.

```typescript
{
  id: 'choreographers',
  header: '🔗 Choreographers',
  Cell: ({ row }) => <RelationCell ... />,
  meta: { inputType: 'relation' },
}
```

#### Custom Cell Rendering

Any column can override how its value displays in the table with a `Cell` function. This doesn't affect the edit form.

```typescript
{
  accessorKey: 'url',
  header: 'URL',
  Cell: ({ row }) => row.original.url
    ? <a href={row.original.url} target='_blank'>{row.original.url}</a>
    : null,
}
```

#### Excluding a Field from the Edit Form

`RecordEdit` skips a column when:
1. **`meta: { inputType: 'relation' }`** — rendered as a relation editor (from `relationEditors` prop), not a form field
2. **No `accessorKey`** — columns using `id` only are not included in form submission
3. **`meta: { readonly: true }`** — visible in table/view but excluded from the edit form:

```typescript
{
  accessorKey: 'created_at',
  header: 'Date Added',
  meta: { inputType: 'date', readonly: true },
}
```

#### Hiding a Column from the Table by Default

Use `columnVisibility` in `tableInitialState`. The user can still toggle it on via column visibility controls.

```typescript
export const tableInitialState = {
  columnVisibility: {
    url: false,
    created_at: false,
  },
  // ...
};
```

#### Disabling Sorting

`enableSorting: false` works as expected. Note that `enableColumnFilter` has no effect because MRT's built-in column filters are disabled globally in `useTable.ts` (`enableColumnFilters: false`), so per-column filter settings are never consulted. All filtering goes through the `QueryBuilder`. Similarly, `filterFn` on column definitions has no effect.

```typescript
{
  accessorKey: 'video',
  header: 'Video',
  enableSorting: false,
}
```

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

4. **Add to `columns`** in `config.tsx`:
   ```typescript
   {
     accessorKey: 'duration',
     header: 'Duration (min)',
     size: 150,
   }
   ```

   That's it. `RecordEdit` generates the input automatically. The API layer selects all columns (`select('*')`), so no API changes are needed unless you're adding a relation.

5. **Add to `queryFields`** if users should filter by it:
   ```typescript
   { name: 'duration', label: 'Duration', inputType: 'number' },
   ```

---

### Adding a Computed Field for Query Builder Filtering

The query evaluator (`src/components/QueryBuilder/queryEvaluator.ts`) resolves field values from the dance row before applying filter operators. It has two resolution strategies:

**Automatic — FK lookup objects with a `.name` property:**
Fields like `formation`, `dance_type`, `progression` resolve automatically. `row['formation']` returns `{ id, name, sort_order }`, and the evaluator extracts `.name`. No evaluator changes needed when adding a new FK lookup field — just add it to `queryFields` using the relation alias name (e.g. `'formation'`, not `'formation_id'`).

**Explicit mapping — junction-table alias fields:**
Fields like `choreographerNames`, `keyMoveNames` don't match any property on the row (the actual data lives in `dances_choreographers` etc.). These require an explicit case in `resolveFieldValue` in `queryEvaluator.ts`, mapping the alias to the correct nested traversal:

```typescript
case 'choreographerNames':
  return row.dances_choreographers?.map((dc: any) => dc.choreographer.name).join(' ') ?? '';
```

Then add to `queryFields` in `config.tsx` using the alias name:

```typescript
{ name: 'choreographerNames', label: 'Choreographers', inputType: 'string' },
```

---

## Key Files Reference

| Concern | File |
|---|---|
| Routing + providers | `src/App.tsx` |
| Drawer state | `src/contexts/DrawerContext.tsx` |
| Page title sync | `src/contexts/TitleContext.tsx` |
| Undo/redo | `src/contexts/UndoContext.tsx` |
| Custom types | `src/lib/types/database.ts` |
| Auto-generated types (don't edit) | `src/lib/types/database_generated.ts` |
| Supabase client | `src/lib/supabase.ts` |
| TanStack Query client | `src/lib/react-query.ts` |
| Hook: Pending relation staging | `src/hooks/usePendingRelations.ts` |
| Hook: Table state + client filtering | `src/hooks/useTable.ts` |
| Hook: localStorage persistence | `src/hooks/usePersistence.ts` |
| Hook: Toast notifications | `src/hooks/useNotify.tsx` |
| Hook: Realtime sync | `src/hooks/useRealtimeSync.ts` |
| Generic table page | `src/components/TablePage.tsx` |
| Drawer router | `src/components/RecordDrawer.tsx` |
| Generic edit form | `src/components/RecordEdit.tsx` |
| Generic view display | `src/components/RecordView.tsx` |
| Relation edit UI | `src/components/RelationEditor.tsx` |
| Relation display (table cell + drawer view) | `src/components/RelationCell.tsx` |
| Query builder evaluator | `src/components/QueryBuilder/queryEvaluator.ts` |
| Dance config | `src/components/Dances/config.tsx` |
| Program config | `src/components/Programs/config.tsx` |
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
- [ ] Column added to `config.tsx` with `accessorKey`, `Cell` renderer showing `.name`, and `meta: { inputType: 'select' }`
- [ ] Field added to `queryFields` in `config.tsx` using the relation alias name (not the `_id` column name)
- [ ] Hook imported in `Dance.tsx` and entry added to the `selectOptions` map
- [ ] `selectOptions` passed to `RecordEdit` in `Dance.tsx`

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

**If surfacing in dances (table column + drawer):**
- [ ] Junction array added to `Dance` type in `src/lib/types/database.ts`
- [ ] Select string in `src/hooks/useDances.ts` updated to eager-load relation
- [ ] Mutation hooks created in `src/hooks/useDances{Model}s.ts` with inlined Supabase add/remove functions
- [ ] `buildRelationsColumns` in `src/hooks/useDances.ts` updated with computed name string (if filtering needed)
- [ ] `resolveFieldValue` in `src/components/QueryBuilder/queryEvaluator.ts` updated with explicit case for the computed alias field (if filtering needed)
- [ ] Column added to `src/components/Dances/config.tsx` with `Cell` renderer and `meta: { inputType: 'relation' }`. For auxiliary-table relations, use a plain text join (e.g. `.map(dc => dc.name).join(', ')`), not `RelationCell`.
- [ ] `RelationEditor` added to `relationEditors` prop in `Dance.tsx` (keyed by column id; view mode is automatic)
- [ ] Computed field added to `queryFields` in `config.tsx` (if filtering needed)

## Checklist: New Primary Model (Full Table + Drawer)

- [ ] Supabase migration created and applied
- [ ] `supabase gen types typescript --local > src/lib/types/database_generated.ts`
- [ ] `Model` union updated in `src/lib/types/database.ts`
- [ ] Custom types (`*Row`, `*`, `*Insert`, `*Update`) added to `database.ts`
- [ ] TanStack Query hooks created in `src/hooks/use{Model}s.ts` with inlined Supabase functions
- [ ] `config.tsx` created with `newRecord`, `columns`, `tableInitialState`, `queryFields`, `defaultQuery`
- [ ] Detail component (`{Model}.tsx`) created
- [ ] Table component (`{Model}s.tsx`) created
- [ ] `index.ts` created
- [ ] Model added to `DETAIL_COMPONENTS` in `src/components/RecordDrawer.tsx`
- [ ] Route added in `src/App.tsx`
- [ ] Nav link added in `src/components/layouts/NavBar.tsx`

## Checklist: New Relation

- [ ] Join table migration created and applied
- [ ] Types regenerated
- [ ] Join arrays added to both sides in `src/lib/types/database.ts`
- [ ] `.select()` strings updated in both entity API files
- [ ] Mutation hooks created for add/remove in `src/hooks/use{Model}s{Entity}s.ts` with inlined Supabase functions
- [ ] Hook `select` transform updated with computed name string (if filtering by name is needed)
- [ ] `resolveFieldValue` in `src/components/QueryBuilder/queryEvaluator.ts` updated with explicit case for the computed alias field (if filtering needed)
- [ ] Column added to `config.tsx` with `Cell: <RelationCell .../>` and `meta: { inputType: 'relation' }` (view display is automatic via `RecordView`). Use `RelationCell` only for primary-model relations (entities in `DETAIL_COMPONENTS`); use a plain text join for auxiliary-table relations.
- [ ] `RelationEditor` added to `relationEditors` prop in detail component (keyed by column id)
- [ ] `queryFields` updated with computed name field (if applicable)
- [ ] Query invalidations in mutation hooks cover all affected query keys
