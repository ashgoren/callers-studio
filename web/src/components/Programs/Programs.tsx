import { useState, useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { useTable } from '@/hooks/useTable';
import { usePrograms } from '@/hooks/usePrograms';
import { MaterialReactTable } from 'material-react-table';
import { DetailDrawer } from '@/components/DetailDrawer';
import { QueryBuilderComponent } from '@/components/QueryBuilder';
import { TableControls } from '@/components/TableControls';
import { queryFields, defaultQuery, columns, tableInitialState } from './config';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { Spinner, ErrorMessage } from '@/components/shared';
import { countActiveRules } from '../QueryBuilder/utils';
import type { Program } from '@/lib/types/database';

export const Programs = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Programs'), [setTitle]);

  const { openDrawer } = useDrawerActions();

  const onRowClick = (program: Program) => {
    openDrawer('program', program.id);
  };

  const { data, error, isLoading } = usePrograms();
  const { table, query, setQuery } = useTable<Program>({
    model: 'program',
    data,
    columns,
    defaultQuery,
    tableInitialState,
    onRowClick,
  });

  const [filterOpen, setFilterOpen] = useState(countActiveRules(query.rules) > 0);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <TableControls
        model='program'
        query={query}
        setFilterOpen={setFilterOpen}
      />

      <QueryBuilderComponent
        fields={queryFields}
        defaultQuery={defaultQuery}
        query={query}
        onQueryChange={setQuery}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
      />

      <MaterialReactTable table={table} />

      <DetailDrawer />
    </>
  );
};
