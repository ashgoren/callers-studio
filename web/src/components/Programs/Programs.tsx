import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { TablePage } from '@/components/TablePage';
import { usePrograms } from '@/hooks/usePrograms';
import { queryFields, defaultQuery, columns, tableInitialState } from './config';
import type { Program } from '@/lib/types/database';

export const Programs = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Programs'), [setTitle]);

  return (
    <TablePage<Program>
      model='program'
      useData={usePrograms}
      columns={columns}
      queryFields={queryFields}
      defaultQuery={defaultQuery}
      tableInitialState={tableInitialState}
    />
  );
};
