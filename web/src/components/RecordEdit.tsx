import { useState, useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, TextField, Button, Checkbox, FormControlLabel, Autocomplete } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useConfirm } from 'material-ui-confirm';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DrawerLayout } from './DrawerLayout';
import { useDrawerActions, useDrawerState } from '@/contexts/DrawerContext';
import type { ColumnDef } from '@tanstack/react-table';
import type { MRT_RowData, MRT_ColumnDef } from 'material-react-table';

type InputFieldType = 'boolean' | 'number' | 'date' | 'text' | 'select';

export type SelectOption = { value: number; label: string };

type ColumnDefWithMeta<TData> = ColumnDef<TData> & {
  meta?: {
    inputType?: InputFieldType;
    readonly?: boolean;
  };
};

type RecordEditProps<TData extends MRT_RowData> = {
  data: Partial<TData>;
  columns: MRT_ColumnDef<TData>[];
  title?: string;
  onSave: (updates: any) => Promise<unknown>; // used for both create and update
  hasPendingRelationChanges: boolean;
  selectOptions?: Record<string, SelectOption[]>;
  children?: React.ReactNode;
};

export const RecordEdit = <TData extends MRT_RowData>({
  data,
  columns,
  title,
  onSave,
  hasPendingRelationChanges,
  selectOptions = {},
  children
}: RecordEditProps<TData>) => {
  const confirm = useConfirm();
  const { mode } = useDrawerState();
  const { setMode, closeDrawer } = useDrawerActions();

  // This also clears pending relation changes since the component will unmount and remount with a new record or mode
  const navigateAway = () => {
    if (mode === 'create') {
      closeDrawer();
    } else {
      setMode('view');
    }
  };

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

  const handleCancel = async () => {
    if (isDirty || hasPendingRelationChanges) {
      const { confirmed } = await confirm({
        title: 'Unsaved Changes',
        description: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmationText: 'Discard',
        cancellationText: 'Keep Editing',
      });
      if (!confirmed) return;
    }
    navigateAway();
  };

  const handleChange = (key: string, value: unknown) => {
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
      navigateAway();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DrawerLayout
      title={title || 'Edit'}
      onClose={handleCancel}
      footer={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='outlined'
            color='inherit'
            onClick={handleCancel}
            fullWidth
            disabled={saving}
          >
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
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        {row.getAllCells().map((cell) => {
          const column = cell.column;
          const key = column.id;

          // Skip non-editable columns
          if (key === 'id' || key === 'created_at') return null; // skip id and created_at columns
          if (!('accessorKey' in column.columnDef)) return null; // skip display columns
          if ((column.columnDef as ColumnDefWithMeta<TData>).meta?.readonly) return null;

          const label = typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : key;

          const value = formData[key];
          const fieldType = (column.columnDef as ColumnDefWithMeta<TData>).meta?.inputType || inferFieldType(data[key]);

          const options = selectOptions[key] ?? [];
          const selectedOption = options.find(o => o.value === value) ?? null;

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
              ) : fieldType === 'date' ? (
                <DatePicker
                  label={label}
                  value={value ? new Date(value) : null}
                  onChange={(newValue) => handleChange(key, newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              ) : fieldType === 'select' ? (
                <Autocomplete
                  options={options}
                  getOptionLabel={(o) => o.label}
                  value={selectedOption}
                  onChange={(_, newValue) => handleChange(key, newValue?.value ?? null)}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  renderInput={(params) => <TextField {...params} label={label} size='small' />}
                  clearOnEscape
                  fullWidth
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

    </DrawerLayout>
  );
};

const inferFieldType = (value: unknown): InputFieldType => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) return 'date';
  return 'text';
};
