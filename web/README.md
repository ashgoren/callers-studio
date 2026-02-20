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
Supabase → src/lib/api/ → src/hooks/ → Components
```

- **`src/lib/api/`** — Thin Supabase query functions. Eager-loads relations via `.select('*, relation(*)')`.
- **`src/hooks/`** — TanStack Query v5 wrappers. Handle CRUD, caching, and invalidation.
- **`src/components/{Entity}/config.tsx`** — Column definitions, default form values, query builder config.
- **`TablePage`** — Generic wrapper connecting a data hook + column config to Material React Table.
- **`RecordDrawer`** — Right-side drawer for view/edit/create. Managed by `DrawerContext`.

---

## Developer Guides

### Adding a New Table / Model

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

#### 3. API Layer — `src/lib/api/venues.ts`

Create CRUD functions. Always eager-load relations needed in the UI:

```typescript
import { supabase } from '@/lib/supabase';
import type { Venue, VenueInsert, VenueUpdate } from '@/lib/types/database';

export const getVenues = async () => {
  const { data, error } = await supabase.from('venues').select('*');
  if (error) throw new Error(error.message);
  return data as Venue[];
};

export const getVenue = async (id: number) => {
  const { data, error } = await supabase.from('venues').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data as Venue;
};

export const createVenue = async (venue: VenueInsert) => {
  const { data, error } = await supabase.from('venues').insert(venue).select('*').single();
  if (error) throw new Error(error.message);
  return data as Venue;
};

export const updateVenue = async (id: number, updates: VenueUpdate) => {
  const { data, error } = await supabase.from('venues').update(updates).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data as Venue;
};

export const deleteVenue = async (id: number) => {
  const { error } = await supabase.from('venues').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
```

#### 4. Query Hook — `src/hooks/useVenues.ts`

Wrap the API layer with TanStack Query. Invalidate all affected query keys on mutation:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotify } from './useNotify';
import { getVenues, getVenue, createVenue, updateVenue, deleteVenue } from '@/lib/api/venues';
import type { VenueInsert, VenueUpdate } from '@/lib/types/database';

export const useVenues = () =>
  useQuery({ queryKey: ['venues'], queryFn: getVenues });

export const useVenue = (id: number) =>
  useQuery({ queryKey: ['venue', id], queryFn: () => getVenue(id), enabled: !!id });

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  const { toastError } = useNotify();
  return useMutation({
    mutationFn: (venue: VenueInsert) => createVenue(venue),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['venues'] }),
    onError: (err: Error) => toastError(err.message),
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  const { toastError } = useNotify();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: VenueUpdate }) => updateVenue(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['venue', id] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err: Error) => toastError(err.message),
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  const { toastError } = useNotify();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteVenue(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['venues'] }),
    onError: (err: Error) => toastError(err.message),
  });
};
```

#### 5. Config — `src/components/Venues/config.tsx`

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

#### 6. Detail Component — `src/components/Venues/Venue.tsx`

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

#### 7. Table Component — `src/components/Venues/Venues.tsx`

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

#### 8. Index File — `src/components/Venues/index.ts`

```typescript
export * from './Venue';
export * from './Venues';
export * from './config';
```

#### 9. Wire Up the Drawer — `src/components/RecordDrawer.tsx`

Add the component to the `DETAIL_COMPONENTS` map:

```typescript
import { Venue } from './Venues/Venue';

const DETAIL_COMPONENTS: Record<string, React.ComponentType<{ id?: number }>> = {
  dance: Dance,
  program: Program,
  choreographer: Choreographer,
  venue: Venue, // add this
};
```

#### 10. Add a Route — `src/App.tsx`

```typescript
import { Venues } from './components/Venues';

// inside <Routes>:
<Route path='/venues' element={<Venues />} />
```

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
  programs_dances: { id: number; order: number; program: ProgramRow }[],
  dances_choreographers: { id: number; choreographer: ChoreographerRow }[],
  dances_venues: { id: number; venue: VenueRow }[],  // add here
};

export type Venue = VenueRow & {
  dances_venues: { id: number; dance: DanceRow }[],  // add here
};
```

#### 3. Update the API Select Strings

In `src/lib/api/dances.ts`, update every `.select()` call to include the new join:

```typescript
.select('*, programs_dances(...), dances_choreographers(...), dances_venues(id, venue:venues(*))')
```

Do the same in `src/lib/api/venues.ts` if you want dances eager-loaded from the venue side.

#### 4. API Layer for the Join Table — `src/lib/api/dancesVenues.ts`

```typescript
export const addVenueToDance = async (danceId: number, venueId: number) => {
  const { data, error } = await supabase
    .from('dances_venues')
    .insert({ dance_id: danceId, venue_id: venueId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const removeVenueFromDance = async (danceId: number, venueId: number) => {
  const { error } = await supabase
    .from('dances_venues')
    .delete()
    .eq('dance_id', danceId)
    .eq('venue_id', venueId);
  if (error) throw new Error(error.message);
};
```

#### 5. Mutation Hooks — `src/hooks/useDancesVenues.ts`

```typescript
export const useAddVenueToDance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, venueId }: { danceId: number; venueId: number }) =>
      addVenueToDance(danceId, venueId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};
```

#### 6. Update the Hook's `select` Transform (if needed)

In `src/hooks/useDances.ts`, if need a flattened string for query builder filtering, add it to the `buildRelationsColumns` helper:

```typescript
const buildRelationsColumns = (dance: Dance) => ({
  ...dance,
  // existing...
  venueNames: (dance.dances_venues ?? []).map(dv => dv.venue.name).join(', '),
});
```

#### 7. Add a Relation Column in the Config — `src/components/Dances/config.tsx`

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
},
```

#### 8. Add Relation Editing to the Detail Component — `src/components/Dances/Dance.tsx`

Use `usePendingRelations` to stage add/remove before save. Pass `RelationEditor` as a child of `RecordEdit` and `RelationList` as a child of `RecordView`:

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

// edit/create mode:
<RecordEdit ... hasPendingRelationChanges={pendingVenues.hasPendingChanges}>
  <RelationEditor
    label='Venues'
    allItems={venues ?? []}
    existingIds={(dance?.dances_venues ?? []).map(dv => dv.venue.id)}
    pending={pendingVenues}
    getId={(venue) => venue.id}
    getLabel={(venue) => venue.name}
  />
</RecordEdit>

// view mode:
<RecordView ...>
  <RelationList
    label='🔗 Venues'
    model='venue'
    relations={dance.dances_venues}
    getRelationId={(dv) => dv.venue.id}
    getRelationLabel={(dv) => dv.venue.name}
  />
</RecordView>
```

#### 9. Add to Query Builder Fields (if applicable)

In `config.tsx`, add a field using the computed name string from step 6:

```typescript
export const queryFields = [
  // existing...
  { name: 'venueNames', label: 'Venues', inputType: 'string' },
];
```

---

### Adding Fields to a Config

The `config.tsx` file controls how fields appear in the table, detail view, and edit form.

#### Editable Field (persisted to DB)

Use `accessorKey` matching the DB column name. `RecordEdit` auto-renders an input for it.

```typescript
{
  accessorKey: 'duration',
  header: 'Duration (min)',
  size: 150,
}
```

Field type is inferred from the value in `newRecord`. Override explicitly with `meta.inputType`:

```typescript
{
  accessorKey: 'is_active',
  header: 'Active?',
  meta: { inputType: 'boolean' },  // 'boolean' | 'number' | 'date' | 'text'
}
```

Also add the field to `newRecord`:

```typescript
export const newRecord: DanceInsert = {
  // existing fields...
  duration: null,
};
```

#### Display-Only Column (not in edit form, not saved)

Omit `accessorKey` and use `id` instead. `RecordEdit` skips any column without `accessorKey`.

```typescript
{
  id: 'choreographers',
  header: '🔗 Choreographers',
  Cell: ({ row }) => <RelationCell ... />,
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

`RecordEdit` automatically skips:
1. **`id`** — hardcoded skip
2. **`created_at`** — hardcoded skip
3. **Columns without `accessorKey`** — display-only columns are always skipped
4. **`meta.readonly: true`** — explicit opt-out for any other column:

```typescript
{
  accessorKey: 'computed_field',
  header: 'Computed',
  meta: { readonly: true },  // visible in table/view but excluded from edit form
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

Some filter fields don't map directly to a DB column — for example, `choreographerNames` is a comma-joined string computed from a joined relation so users can type a name to filter dances.

Add the computation in the hook's `select` transform (e.g., `src/hooks/useDances.ts`):

```typescript
const buildRelationsColumns = (dance: Dance) => ({
  ...dance,
  choreographerNames: (dance.dances_choreographers ?? [])
    .map(dc => dc.choreographer.name)
    .join(', '),
  // add new computed fields here
});
```

Then add to `queryFields` in `config.tsx`. The field name must match the key added above:

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
| API: Dances | `src/lib/api/dances.ts` |
| API: Programs | `src/lib/api/programs.ts` |
| API: Choreographers | `src/lib/api/choreographers.ts` |
| API: Join tables | `src/lib/api/programsDances.ts`, `src/lib/api/dancesChoreographers.ts` |
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
| Relation display (table cell) | `src/components/RelationCell.tsx` |
| Relation display (detail view) | `src/components/RelationList.tsx` |
| Query builder evaluator | `src/components/QueryBuilder/queryEvaluator.ts` |
| Dance config | `src/components/Dances/config.tsx` |
| Program config | `src/components/Programs/config.tsx` |
| Choreographer config | `src/components/Choreographers/config.tsx` |

---

## Checklist: New Model

- [ ] Supabase migration created and applied
- [ ] `supabase gen types typescript --local > src/lib/types/database_generated.ts`
- [ ] `Model` union updated in `src/lib/types/database.ts`
- [ ] Custom types (`*Row`, `*`, `*Insert`, `*Update`) added to `database.ts`
- [ ] API functions created in `src/lib/api/{model}s.ts`
- [ ] TanStack Query hooks created in `src/hooks/use{Model}s.ts`
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
- [ ] Join table API functions created (`addX`, `removeX`)
- [ ] Mutation hooks created for add/remove
- [ ] Hook `select` transform updated with computed name string (if filtering by name is needed)
- [ ] `RelationCell` column added to table config on both sides (if applicable)
- [ ] `RelationEditor` added to detail component edit/create modes
- [ ] `RelationList` added to detail component view mode
- [ ] `queryFields` updated with computed name field (if applicable)
- [ ] Query invalidations in mutation hooks cover all affected query keys
