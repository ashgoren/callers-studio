import { getCoreRowModel, getSortedRowModel, getFilteredRowModel, useReactTable, type InitialTableState } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

export const useTable = <TData>(
  data: TData[] | undefined,
  columns: ColumnDef<TData, any>[],
  initialState?: Partial<InitialTableState>
) => {
  return useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState,
    enableSortingRemoval: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange'
  });
};
