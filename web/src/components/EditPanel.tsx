import { useState, useMemo } from 'react';
import { Box, Typography, TextField, Button, Divider, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useDrawerActions } from '@/contexts/DrawerContext';
import type { ColumnDef } from '@tanstack/react-table';
import type { MRT_RowData, MRT_ColumnDef } from 'material-react-table';

type EditPanelProps<TData extends MRT_RowData> = {
  data: Partial<TData>;
  columns: MRT_ColumnDef<TData>[];
  title?: string;
  onSave: (updates: any) => Promise<unknown>;
  hasPendingRelationChanges: boolean;
  onCancel: () => void;
  children?: React.ReactNode;
};

export const EditPanel = <TData extends Record<string, any>>({ data, columns, title, onSave, hasPendingRelationChanges, onCancel, children }: EditPanelProps<TData>) => {
  const { closeDrawer } = useDrawerActions();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<TData>>({ ...data });

  const tableData = useMemo(() => [data], [data]);

  const table = useReactTable<Partial<TData>>({
    data: tableData,
    columns: columns as ColumnDef<Partial<TData>>[],
    getCoreRowModel: getCoreRowModel(),
  });
  const row = table.getRowModel().rows[0];

  const isDirty = useMemo(() => {
    return Object.keys(formData).some((key) => formData[key] !== data[key]);
  }, [formData, data]);

  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmClose) return;
    }
    closeDrawer();
  };

  const handleCancel = () => {
    if (isDirty || hasPendingRelationChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmCancel) return;
    }
    onCancel();
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    console.log('Submitting form data:', formData);
    try {
      const cleanedData = row.getAllCells().reduce((acc, cell) => {
        const column = cell.column;
        const key = column.id;
        if (key === 'id') return acc;
        if (!('accessorKey' in column.columnDef)) return acc;
        const accessorKey = column.columnDef.accessorKey as keyof TData;
        if (formData[accessorKey] !== undefined) acc[accessorKey] = formData[accessorKey];
        return acc;
      }, {} as Partial<TData>);

      await onSave(cleanedData);
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' noWrap sx={{ flex: 1 }}>
          {title || 'Edit'}
        </Typography>
        <IconButton onClick={handleClose} size='small'>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {row.getAllCells().map((cell) => {
          const column = cell.column;
          const key = column.id;

          // Skip non-editable columns
          if (key === 'id') return null; // skip id column
          if (!('accessorKey' in column.columnDef)) return null; // skip display columns
          // if (column.columnDef.meta?.readonly) return null;

          const label = typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : key;

          const value = formData[key];
          const fieldType = inferFieldType(data[key]);

          return (
            <Box key={cell.id}>
              {fieldType === 'boolean' ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(value)}
                      onChange={(e) => handleChange(key, e.target.checked)}
                    />
                  }
                  label={label}
                />
              ) : (
                <TextField
                  label={label}
                  type={fieldType}
                  value={value ?? ''}
                  onChange={(e) =>
                    handleChange(key, fieldType === 'number' ? Number(e.target.value) : e.target.value)
                  }
                  fullWidth
                  size='small'
                  multiline={fieldType === 'text' && String(data[key] ?? '').length > 100}
                  rows={fieldType === 'text' && String(data[key] ?? '').length > 100 ? 3 : 1}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {children} {/* render associations edit component here */}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant='outlined' color='inherit' onClick={handleCancel} fullWidth disabled={saving}>
          Cancel
        </Button>
        <Button
          variant='contained'
          color='success'
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          fullWidth
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

const inferFieldType = (value: unknown): 'boolean' | 'number' | 'text' => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  return 'text';
};
