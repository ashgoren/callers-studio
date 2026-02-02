import { useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { useTable } from '@/hooks/useTable';
import { DetailDrawer } from '@/components/DetailDrawer';
import { QueryBuilderComponent } from '@/components/QueryBuilder';
import { TableControls } from '@/components/TableControls';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { Spinner, ErrorMessage } from '@/components/shared';
import { countActiveRules } from '@/components/QueryBuilder/utils';
import type { MRT_RowData, MRT_ColumnDef, MRT_TableOptions } from 'material-react-table';
import type { Field, RuleGroupType } from 'react-querybuilder';
import type { Model } from '@/lib/types/database';

export const TablePage = <TData extends MRT_RowData & { id: number }>({ model, useData, columns, queryFields, defaultQuery, tableInitialState }: {
  model: Model;
  useData: () => { data: TData[] | undefined; error: unknown; isLoading: boolean; };
  columns: MRT_ColumnDef<TData>[];
  queryFields: Field[];
  defaultQuery: RuleGroupType;
  tableInitialState?: MRT_TableOptions<TData>['initialState'];
}) => {
  const { openDrawer } = useDrawerActions();

  const onRowClick = (row: TData) => {
    openDrawer(model, row.id);
  };  

  const { data, error, isLoading } = useData();
  const { table, query, setQuery } = useTable<TData>({
    model,
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
        model={model}
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
