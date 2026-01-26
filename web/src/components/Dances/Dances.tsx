import { useEffect } from 'react';
import { useTable } from '@/hooks/useTable';
import { DataTable } from '@/components/DataTable';
import { columns, initialState } from './columns';
import { useDances } from '@/hooks/useDances';
import { useTitle } from '@/contexts/TitleContext';

export const Dances = () => {
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle('Dances');
  }, [setTitle]);

  const { data, error, isLoading } = useDances();

  const table = useTable(data, columns, initialState);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading dances: {(error as Error).message}</div>;
  }

  return (
    <DataTable table={table} />
  );
};
