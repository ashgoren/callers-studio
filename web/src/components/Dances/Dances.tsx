import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { useTable } from '@/hooks/useTable';
import { useDances } from '@/hooks/useDances';
// import { DataTable } from '@/components/DataTable';
import { MaterialReactTable } from 'material-react-table';
import { DetailDrawer } from '@/components/DetailDrawer';
import { QueryBuilderComponent } from '@/components/QueryBuilder';
import { fields, defaultQuery, columns, options } from './columns';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { Spinner, ErrorMessage } from '@/components/shared';
import type { Dance } from '@/lib/types/database';

export const Dances = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Dances'), [setTitle]);

  const { openDrawer } = useDrawerActions();

  const onRowClick = (dance: Dance) => {
    openDrawer('dance', dance.id);
  };

  const { data, error, isLoading } = useDances();
  const { table, query, setQuery } = useTable('dances', data, columns, defaultQuery, onRowClick, options);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <QueryBuilderComponent
        tableName='dances'
        fields={fields}
        defaultQuery={defaultQuery}
        query={query}
        onQueryChange={setQuery}
      />

      <MaterialReactTable table={table} />
      {/* <DataTable
        table={table}
        onRowClick={(dance) => openDrawer('dance', dance.id)}
      /> */}

      <DetailDrawer />
    </>
  );
};
