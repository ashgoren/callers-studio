import { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { DrawerLayout } from './DrawerLayout';
import type { ColumnDef } from '@tanstack/react-table';
import type { MRT_RowData, MRT_ColumnDef } from 'material-react-table';

type DetailPanelProps<TData extends MRT_RowData> = {
  data: TData;
  columns: MRT_ColumnDef<TData>[];
  title?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
};

export const DetailPanel = <TData extends Record<string, any>>({ data, columns, title, onEdit, onDelete, children }: DetailPanelProps<TData>) => {
  const tableData = useMemo(() => [data], [data]); // Wrap data in an array for single row

  const table = useReactTable({
    data: tableData,
    columns: columns as ColumnDef<TData>[],
    getCoreRowModel: getCoreRowModel(),
  });
  const row = table.getRowModel().rows[0];

  return (
    <DrawerLayout
      title={title || 'Details'}
      footer={<Footer onEdit={onEdit} onDelete={onDelete} />}
    >
      {/* Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {row.getAllCells().map((cell) => {
          const column = cell.column;

          if (column.id === 'id') return null;
          if (!('accessorKey' in column.columnDef)) return null;  // skip display-only columns

          const label = typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : column.id;

          return (
            <Box key={cell.id}>
              <Typography variant='caption' color='text.secondary'>
                {label}
              </Typography>
              <Typography variant='body1' component='div'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Relation fields (linked items) */}
      {children}
    </DrawerLayout>
  );
};

const Footer = ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => {
  const { closeDrawer } = useDrawerActions();

  return (
    <>
      {/* Actions */}
      {onEdit && (
        <Button
          variant='contained'
          color='warning'
          startIcon={<EditIcon />}
          onClick={onEdit}
          fullWidth
        >
          Edit
        </Button>
      )}

      {onDelete && (
        <Button
          variant='contained'
          color='error'
          onClick={() => {
            if (confirm('Are you sure you want to delete this item?')) {
              onDelete();
              closeDrawer();
            }
          }}
          fullWidth
          sx={{ mt: 1 }}
        >
          Delete
        </Button>
      )}
    </>
  );
};
