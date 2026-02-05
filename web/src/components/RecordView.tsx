import { useMemo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useMaterialReactTable } from 'material-react-table';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { DrawerLayout } from './DrawerLayout';
import type { MRT_RowData, MRT_ColumnDef, MRT_Cell } from 'material-react-table';

type RecordViewProps<TData extends MRT_RowData> = {
  data: TData;
  columns: MRT_ColumnDef<TData>[];
  title?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
};

export const RecordView = <TData extends Record<string, any>>({ data, columns, title, onEdit, onDelete, children }: RecordViewProps<TData>) => {
  const tableData = useMemo(() => [data], [data]); // Wrap data in an array for single row

  // Custom cell renderer to handle MRT's Cell rendering outside of the table context
  const renderCell = (cell: MRT_Cell<TData, unknown>) => {
    const { Cell } = cell.column.columnDef;
    if (Cell) {
      return Cell({
        cell,
        column: cell.column,
        row: cell.row,
        table,
        renderedCellValue: cell.getValue(),
      } as any);
    }
    return (cell.getValue() as ReactNode) ?? '';
  };

  const table = useMaterialReactTable({
    data: tableData,
    columns,
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
          const columnDef = column.columnDef as MRT_ColumnDef<TData>;

          if (column.id === 'id') return null;
          if (!('accessorKey' in columnDef)) return null;  // skip display-only columns

          const label = typeof columnDef.header === 'string'
            ? columnDef.header
            : column.id;

          return (
            <Box key={cell.id}>
              <Typography variant='caption' color='text.secondary'>
                {label}
              </Typography>
              <Typography variant='body1' component='div'>
                {renderCell(cell)}
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
