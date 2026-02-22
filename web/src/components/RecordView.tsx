import { useMemo, type ReactNode } from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useConfirm } from 'material-ui-confirm';
import { useMaterialReactTable } from 'material-react-table';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { DrawerLayout } from './DrawerLayout';
import type { MRT_RowData, MRT_ColumnDef, MRT_Cell } from 'material-react-table';

type RecordViewProps<TData extends MRT_RowData> = {
  data: TData;
  columns: MRT_ColumnDef<TData>[];
  title?: string;
  onDelete: () => void;
  canDelete?: boolean;
  deleteDisabledReason?: string;
};

export const RecordView = <TData extends Record<string, any>>({ data, columns, title, ...deleteProps }: RecordViewProps<TData>) => {
  const tableData = useMemo(() => [data], [data]);

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

  const table = useMaterialReactTable({ data: tableData, columns });
  const row = table.getRowModel().rows[0];

  return (
    <DrawerLayout
      title={title || 'Details'}
      footer={<Footer {...deleteProps} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {row.getAllCells().map((cell) => {
          const columnDef = cell.column.columnDef as MRT_ColumnDef<TData>;
          const label = typeof columnDef.header === 'string' ? columnDef.header : cell.column.id;

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
    </DrawerLayout>
  );
};

const Footer = ({ onDelete, canDelete=true, deleteDisabledReason }: {
  onDelete: () => void;
  canDelete?: boolean;
  deleteDisabledReason?: string
}) => {
  const confirm = useConfirm();
  const { closeDrawer, setMode } = useDrawerActions();

  const handleDelete = async () => {
    const { confirmed } = await confirm({
      title: 'Delete Record',
      description: 'Are you sure you want to delete this item?',
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
    });
    if (confirmed) {
      onDelete();
      closeDrawer();
    }
  };

  return (
    <>
      {/* Actions */}
      <Button
        variant='contained'
        color='warning'
        startIcon={<EditIcon />}
        onClick={() => setMode('edit')}
        fullWidth
      >
        Edit
      </Button>

      <Tooltip title={canDelete ? '' : deleteDisabledReason}>
        <span>
          <Button
            variant='contained'
            color='error'
            onClick={handleDelete}
            disabled={!canDelete}
            fullWidth
            sx={{ mt: 1 }}
          >
            Delete
          </Button>
        </span>
      </Tooltip>
    </>
  );
};
