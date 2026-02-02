import { useMemo } from 'react';
import { Box, Typography, IconButton, Button, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useDrawerActions } from '@/contexts/DrawerContext';
import type { ColumnDef } from '@tanstack/react-table';

type DetailPanelProps<TData> = {
  data: TData;
  columns: ColumnDef<TData>[];
  title?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const DetailPanel = <TData extends Record<string, any>>({ data, columns, title, onEdit, onDelete }: DetailPanelProps<TData>) => {
  const { closeDrawer } = useDrawerActions();

  const tableData = useMemo(() => [data], [data]); // Wrap data in an array for single row

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const row = table.getRowModel().rows[0];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' noWrap sx={{ flex: 1 }}>
          {title || 'Details'}
        </Typography>
        <IconButton onClick={closeDrawer} size='small'>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {row.getAllCells().map((cell) => {
          const column = cell.column;

          if (column.id === 'id') return null;

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

      <Divider sx={{ my: 2 }} />

      {/* Actions */}
      {onEdit && (
        <Button
          variant='contained'
          color='secondary'
          startIcon={<EditIcon />}
          onClick={onEdit}
          fullWidth
        >
          Edit
        </Button>
      )}

      {onDelete && (
        <Button
          variant='outlined'
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
    </Box>
  );
};
