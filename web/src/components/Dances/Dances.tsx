import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { TablePage } from '@/components/TablePage';
import { useDances } from '@/hooks/useDances';
import { queryFields, defaultQuery, columns, tableInitialState } from './config';
import type { Dance } from '@/lib/types/database';

export const Dances = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Dances'), [setTitle]);

  return (
    <>
      <TablePage<Dance>
        model='dance'
        useData={useDances}
        columns={columns}
        queryFields={queryFields}
        defaultQuery={defaultQuery}
        tableInitialState={tableInitialState}
      />
    </>
  );
};
