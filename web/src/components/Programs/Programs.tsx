import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { useTable } from '@/hooks/useTable';
import { usePrograms } from '@/hooks/usePrograms';
import { DataTable } from '@/components/DataTable';
import { QueryBuilderComponent } from '@/components/QueryBuilder';
import { fields, defaultQuery, columns, initialState } from './columns';
import { Spinner, ErrorMessage } from '@/components/shared';

export const Programs = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Programs'), [setTitle]);

  const { data, error, isLoading } = usePrograms();
  const { table, query, setQuery } = useTable(data, columns, defaultQuery, initialState);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <>
      <QueryBuilderComponent
        fields={fields}
        defaultQuery={defaultQuery}
        query={query}
        onQueryChange={setQuery}
      />
      <DataTable table={table} />
    </>
  );
};
