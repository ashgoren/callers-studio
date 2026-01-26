import { useState } from 'react';
import { getCoreRowModel, getSortedRowModel, getFilteredRowModel, useReactTable, type InitialTableState } from '@tanstack/react-table';
import { evaluateQuery } from '@/lib/queryEvaluator';
import type { ColumnDef } from '@tanstack/react-table';
import type { RuleGroupType } from 'react-querybuilder';

const defaultQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'title', operator: 'contains', value: '' }]
};

export const useTable = <TData>(
  data: TData[] | undefined,
  columns: ColumnDef<TData, any>[],
  initialState?: Partial<InitialTableState>
) => {
  const [query, setQuery] = useState<RuleGroupType>(defaultQuery);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState,
    enableSortingRemoval: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    globalFilterFn: (row, _columnId, filterValue: RuleGroupType) => evaluateQuery(row.original, filterValue),
    state: { globalFilter: query }
  });

  return { table, query, setQuery };
};
