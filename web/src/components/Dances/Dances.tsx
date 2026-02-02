import { useState, useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { useTable } from '@/hooks/useTable';
import { useDances } from '@/hooks/useDances';
import { MaterialReactTable } from 'material-react-table';
import { DetailDrawer } from '@/components/DetailDrawer';
import { QueryBuilderComponent } from '@/components/QueryBuilder';
import { TableControls } from '@/components/TableControls';
import { queryFields, defaultQuery, columns, tableInitialState } from './config';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { Spinner, ErrorMessage } from '@/components/shared';
import { countActiveRules } from '../QueryBuilder/utils';
import type { Dance } from '@/lib/types/database';

export const Dances = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Dances'), [setTitle]);

  const { openDrawer } = useDrawerActions();

  const onRowClick = (dance: Dance) => {
    openDrawer('dance', dance.id);
  };

  const { data, error, isLoading } = useDances();
  const { table, query, setQuery } = useTable<Dance>({
    model: 'dance',
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
        model='dance'
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
