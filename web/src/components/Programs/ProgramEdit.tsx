import { useState, useMemo, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useBlocker } from 'react-router';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useConfirm } from 'material-ui-confirm';
import { ProgramDancesEditor } from './ProgramDancesEditor';
import { newRecord } from './config';
import { useCreateProgram, useUpdateProgram } from '@/hooks/usePrograms';
import { useAddDanceToProgram, useRemoveDanceFromProgram } from '@/hooks/useProgramsDances';
import { useDances } from '@/hooks/useDances';
import { usePendingRelations } from '@/hooks/usePendingRelations';
import { useNotify } from '@/hooks/useNotify';
import { useTitle } from '@/contexts/TitleContext';
import { useUndoActions, dbRecord, beforeValues, relationOps } from '@/contexts/UndoContext';
import { formatLocalDate } from '@/lib/utils';
import type { Program, ProgramInsert, ProgramUpdate } from '@/lib/types/database';

export const ProgramEditMode = ({ program, onCancel }: { program?: Program; onCancel?: () => void }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { toastSuccess } = useNotify();
  const { pushAction } = useUndoActions();
  const { setTitle } = useTitle();

  useEffect(
    () => setTitle(program?.date ? `Edit: ${formatLocalDate(program.date)}` : 'New Program'),
    [setTitle, program?.date]
  );

  const isCreate = program === undefined;

  const { mutateAsync: createProgram, isPending: isCreating } = useCreateProgram();
  const { mutateAsync: updateProgram, isPending: isUpdating } = useUpdateProgram();
  const { mutateAsync: addDance } = useAddDanceToProgram();
  const { mutateAsync: removeDance } = useRemoveDanceFromProgram();

  const { data: dances } = useDances();

  const pendingDances = usePendingRelations<{ danceId: number; order: number }>({
    getId: ({ danceId }) => danceId,
  });

  const [initialFormData] = useState<ProgramUpdate>(() => ({
    date: program?.date ?? newRecord.date,
    location: program?.location ?? newRecord.location,
  }));
  const [formData, setFormData] = useState<ProgramUpdate>({ ...initialFormData });
  const [isSaved, setIsSaved] = useState(false);

  const isSaving = isCreating || isUpdating;


  // ---------- Unsaved changes handling ----------

  // Has any form field changed?
  const isDirty = useMemo(() =>
    Object.keys(formData).some(key =>
      (formData as Record<string, unknown>)[key] !== (initialFormData as Record<string, unknown>)[key]
    ),
    [formData, initialFormData]
  );

  // Any pending changes to relations?
  const hasPendingChanges = pendingDances.hasPendingChanges;

  // Warn on in-app navigation
  const blocker = useBlocker(!isSaved && (isDirty || hasPendingChanges));
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    confirm({
      title: 'Leave without saving?',
      description: 'Your unsaved changes will be lost.',
      confirmationText: 'Leave',
      cancellationText: 'Stay',
    }).then(({ confirmed }) => {
      if (confirmed) blocker.proceed();
      else blocker.reset();
    }).catch(() => blocker.reset());
  }, [blocker.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn on tab close / browser refresh
  useEffect(() => {
    if (!(isDirty || hasPendingChanges)) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, hasPendingChanges]);

  // Warn on switch back to view mode
  const handleCancel = async () => {
    if (isDirty || hasPendingChanges) {
      const { confirmed } = await confirm({
        title: 'Discard changes?',
        description: 'Your unsaved changes will be lost.',
        confirmationText: 'Discard',
        cancellationText: 'Keep editing',
      });
      if (!confirmed) return;
    }
    if (isCreate) {
      flushSync(() => setIsSaved(true)); // Synchronously set to disable blocker before navigating away
      navigate('/programs');
    } else {
      onCancel?.(); // Go back to view mode
    }
  };


  // ---------- Form handling ----------

  const update = (key: keyof ProgramUpdate, value: unknown) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const { id: programId } = isCreate
      ? await createProgram(formData as ProgramInsert)
      : await updateProgram({ id: program!.id, updates: formData });

    const { added, removed } = await pendingDances.commitChanges(
      ({ danceId, order }) => addDance({ programId, danceId, order }),
      (danceId) => removeDance({ programId, danceId }),
    );

    if (isCreate) {
      pushAction({
        label: `Create Program: ${formatDate(formData)}`,
        ops: [
          { type: 'insert', table: 'programs', record: { id: programId, ...formData } },
          ...relationOps('programs_dances', added, []),
        ],
      });
      toastSuccess('Program created');
      flushSync(() => setIsSaved(true)); // Synchronously set to disable blocker before navigating away
      navigate(`/programs/${programId}`);
    } else {
      pushAction({
        label: `Edit Program: ${formatDate(formData)}`,
        ops: [
          {
            type: 'update', table: 'programs', id: programId,
            before: beforeValues(program!, formData, newRecord),
            after: dbRecord(formData, newRecord),
          },
          ...relationOps('programs_dances', added, removed),
        ],
      });
      toastSuccess('Program updated');
      onCancel?.(); // Go back to view mode
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant='h5' sx={{ mb: 2 }}>
        {isCreate ? 'New Program' : `Edit: ${formatDate(program!)}`}
      </Typography>

      <Stack spacing={2}>
        <TextField
          label='Date'
          type='date'
          value={formData.date ?? ''}
          onChange={e => update('date', e.target.value || null)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label='Location'
          value={formData.location ?? ''}
          onChange={e => update('location', e.target.value)}
          fullWidth
        />

        <ProgramDancesEditor
          programDances={program?.programs_dances ?? []}
          dances={dances ?? []}
          pending={pendingDances}
        />
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button onClick={handleCancel} disabled={isSaving}>Cancel</Button>
        <Button variant='contained' startIcon={<SaveIcon />} onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : isCreate ? 'Create' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

const formatDate = (program: { date?: string | null }) =>
  program.date ? formatLocalDate(program.date) : '';
