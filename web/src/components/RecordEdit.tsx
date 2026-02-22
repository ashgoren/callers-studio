import React, { useState, useMemo, type ReactNode } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, TextField, Button, Checkbox, FormControlLabel, Autocomplete } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useConfirm } from 'material-ui-confirm';
import { DrawerLayout } from './DrawerLayout';
import { useDrawerActions, useDrawerState } from '@/contexts/DrawerContext';
import type { MRT_RowData, MRT_ColumnDef } from 'material-react-table';

type InputFieldType = 'boolean' | 'number' | 'date' | 'text' | 'select' | 'relation';

type ColumnDefWithMeta<TData extends MRT_RowData> = MRT_ColumnDef<TData> & {
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
  selectOptions?: Record<string, { value: number; label: string }[]>;
  relationEditors?: Record<string, ReactNode>;
};

export const RecordEdit = <TData extends MRT_RowData>({
  data, columns, title, onSave, hasPendingRelationChanges, selectOptions = {}, relationEditors = {},
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
    try {
      const cleanedData = columns.reduce((acc, col) => {
        if (!('accessorKey' in col)) return acc;
        const key = col.accessorKey as keyof TData;
        if (formData[key] !== undefined) acc[key] = formData[key];
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
        {columns.map((col, i) => {
          const colDef = col as ColumnDefWithMeta<TData>;
          const colId = colDef.id ?? ('accessorKey' in col ? String(col.accessorKey) : String(i));

          if (colDef.meta?.inputType === 'relation') {
            const editor = relationEditors[colId];
            return editor ? <React.Fragment key={colId}>{editor}</React.Fragment> : null;
          }

          if (colDef.meta?.readonly || !('accessorKey' in col)) return null;

          const key = col.accessorKey as string;
          const label = typeof col.header === 'string' ? col.header : key;
          const value = formData[key];
          const fieldType = colDef.meta?.inputType;
          const options = selectOptions[key] ?? [];
          const selectedOption = options.find(o => o.value === value) ?? null;

          return (
            <Box key={key}>
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
                  value={value ? new Date(value as string) : null}
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
                  multiline={fieldType === 'text' && String(data[key as keyof TData] ?? '').length > 100}
                  rows={fieldType === 'text' && String(data[key as keyof TData] ?? '').length > 100 ? 3 : 1}
                />
              )}
            </Box>
          );
        })}
      </Box>

    </DrawerLayout>
  );
};
