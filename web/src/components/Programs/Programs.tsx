import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { useTable } from '@/hooks/useTable';
import { usePrograms } from '@/hooks/usePrograms';
// import { DataTable } from '@/components/DataTable';
import { MaterialReactTable } from 'material-react-table';
import { DetailDrawer } from '@/components/DetailDrawer';
import { QueryBuilderComponent } from '@/components/QueryBuilder';
import { fields, defaultQuery, columns, options } from './columns';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { Spinner, ErrorMessage } from '@/components/shared';
import type { Program } from '@/lib/types/database';

export const Programs = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Programs'), [setTitle]);

  const { openDrawer } = useDrawerActions();

  const onRowClick = (program: Program) => {
    openDrawer('program', program.id);
  };

  const { data, error, isLoading } = usePrograms();
  const { table, query, setQuery } = useTable('programs', data, columns, defaultQuery, onRowClick, options);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <QueryBuilderComponent
        tableName='programs'
        fields={fields}
        defaultQuery={defaultQuery}
        query={query}
        onQueryChange={setQuery}
      />

      <MaterialReactTable table={table} />
      {/* <DataTable
        table={table}
        onRowClick={(program) => openDrawer('program', program.id)}
      /> */}

      <DetailDrawer />
    </>
  );
};
