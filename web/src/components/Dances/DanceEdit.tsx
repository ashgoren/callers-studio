import { useState, useMemo, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useBlocker } from 'react-router';
import { Box, Button, Tabs, Tab, TextField, Checkbox, FormControlLabel, Typography, Autocomplete, Divider, Stack, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useConfirm } from 'material-ui-confirm';
import { RelationEditor } from '@/components/RelationEditor';
import { FiguresEditor } from './FiguresEditor';
import { newRecord } from './config';
import { useCreateDance, useUpdateDance } from '@/hooks/useDances';
import { useAddChoreographerToDance, useRemoveChoreographerFromDance } from '@/hooks/useDancesChoreographers';
import { useAddKeyMoveToDance, useRemoveKeyMoveFromDance } from '@/hooks/useDancesKeyMoves';
import { useAddVibeToDance, useRemoveVibeFromDance } from '@/hooks/useDancesVibes';
import { useChoreographers } from '@/hooks/useChoreographers';
import { useKeyMoves } from '@/hooks/useKeyMoves';
import { useVibes } from '@/hooks/useVibes';
import { useDanceTypes } from '@/hooks/useDanceTypes';
import { useFormations } from '@/hooks/useFormations';
import { useProgressions } from '@/hooks/useProgressions';
import { usePendingRelations } from '@/hooks/usePendingRelations';
import { useFigures } from '@/hooks/useFigures';
import { useNotify } from '@/hooks/useNotify';
import { useTitle } from '@/contexts/TitleContext';
import { useUndoActions, dbRecord, beforeValues, relationOps } from '@/contexts/UndoContext';
import type { Dance, DanceInsert, DanceUpdate } from '@/lib/types/database';

export const DanceEditMode = ({ dance, onCancel }: { dance?: Dance; onCancel?: () => void }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { toastSuccess } = useNotify();
  const { pushAction } = useUndoActions();
  const { setTitle } = useTitle();

  useEffect(
    () => setTitle(dance?.title ? `Edit: ${dance.title}` : 'New Dance'),
    [setTitle, dance?.title]
  );

  const isCreate = dance === undefined;

  const { mutateAsync: createDance, isPending: isCreating } = useCreateDance();
  const { mutateAsync: updateDance, isPending: isUpdating } = useUpdateDance();
  const { mutateAsync: addChoreographer } = useAddChoreographerToDance();
  const { mutateAsync: removeChoreographer } = useRemoveChoreographerFromDance();
  const { mutateAsync: addKeyMove } = useAddKeyMoveToDance();
  const { mutateAsync: removeKeyMove } = useRemoveKeyMoveFromDance();
  const { mutateAsync: addVibe } = useAddVibeToDance();
  const { mutateAsync: removeVibe } = useRemoveVibeFromDance();

  const { data: choreographers } = useChoreographers();
  const { data: keyMoves } = useKeyMoves();
  const { data: vibes } = useVibes();
  const { data: danceTypes } = useDanceTypes();
  const { data: formations } = useFormations();
  const { data: progressions } = useProgressions();

  const pendingChoreographers = usePendingRelations();
  const pendingKeyMoves = usePendingRelations();
  const pendingVibes = usePendingRelations();
  const pendingFigures = useFigures(dance);

  const [initialFormData] = useState<DanceUpdate>(() => ({
    title: dance?.title ?? newRecord.title,
    url: dance?.url ?? newRecord.url,
    video: dance?.video ?? newRecord.video,
    dance_type_id: dance?.dance_type_id ?? newRecord.dance_type_id,
    formation_id: dance?.formation_id ?? newRecord.formation_id,
    progression_id: dance?.progression_id ?? newRecord.progression_id,
    difficulty: dance?.difficulty ?? newRecord.difficulty,
    swing_16: dance?.swing_16 ?? newRecord.swing_16,
    notes: dance?.notes ?? newRecord.notes,
    place_in_program: dance?.place_in_program ?? newRecord.place_in_program,
    moves: dance?.moves ?? newRecord.moves,
  }));
  const [formData, setFormData] = useState<DanceUpdate>({ ...initialFormData });
  const [tab, setTab] = useState(0);
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

  // Any pending changes to relations or figures?
  const hasPendingChanges =
    pendingChoreographers.hasPendingChanges ||
    pendingKeyMoves.hasPendingChanges ||
    pendingVibes.hasPendingChanges ||
    pendingFigures.hasPendingChanges;

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
      navigate('/dances');
    } else {
      onCancel?.(); // Go back to view mode
    }
  };


  // ---------- Form handling ----------

  const update = (key: keyof DanceUpdate, value: unknown) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const updatesWithFigures = { ...formData, figures: pendingFigures.figures };

    const { id: danceId } = isCreate
      ? await createDance(updatesWithFigures as DanceInsert)
      : await updateDance({ id: dance!.id, updates: updatesWithFigures });

    const { added: addedChoreographers, removed: removedChoreographers } = await pendingChoreographers.commitChanges(
      (choreographerId) => addChoreographer({ danceId, choreographerId }),
      (choreographerId) => removeChoreographer({ danceId, choreographerId }),
    );
    const { added: addedKeyMoves, removed: removedKeyMoves } = await pendingKeyMoves.commitChanges(
      (keyMoveId) => addKeyMove({ danceId, keyMoveId }),
      (keyMoveId) => removeKeyMove({ danceId, keyMoveId }),
    );
    const { added: addedVibes, removed: removedVibes } = await pendingVibes.commitChanges(
      (vibeId) => addVibe({ danceId, vibeId }),
      (vibeId) => removeVibe({ danceId, vibeId }),
    );

    if (isCreate) {
      pushAction({
        label: `Create Dance: ${formData.title}`,
        ops: [
          { type: 'insert', table: 'dances', record: { id: danceId, ...updatesWithFigures } },
          ...relationOps('dances_choreographers', addedChoreographers, []),
          ...relationOps('dances_key_moves', addedKeyMoves, []),
          ...relationOps('dances_vibes', addedVibes, []),
        ],
      });
      toastSuccess('Dance created');
      flushSync(() => setIsSaved(true)); // Synchronously set to disable blocker before navigating away
      navigate(`/dances/${danceId}`);
    } else {
      pushAction({
        label: `Edit Dance: ${formData.title}`,
        ops: [
          {
            type: 'update', table: 'dances', id: danceId,
            before: beforeValues(dance!, updatesWithFigures, newRecord),
            after: dbRecord(updatesWithFigures, newRecord),
          },
          ...relationOps('dances_choreographers', addedChoreographers, removedChoreographers),
          ...relationOps('dances_key_moves', addedKeyMoves, removedKeyMoves),
          ...relationOps('dances_vibes', addedVibes, removedVibes),
        ],
      });
      toastSuccess('Dance updated');
      onCancel?.(); // Go back to view mode
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant='h5' sx={{ mb: 2 }}>
        {isCreate ? 'New Dance' : `Edit: ${dance!.title}`}
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label='Details' />
        <Tab label='Figures' />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <TextField label='Title' value={formData.title ?? ''} onChange={e => update('title', e.target.value)} fullWidth />
          <TextField label='URL' value={formData.url ?? ''} onChange={e => update('url', e.target.value)} fullWidth />
          <TextField label='Video' value={formData.video ?? ''} onChange={e => update('video', e.target.value)} fullWidth />

          <Autocomplete
            options={danceTypes ?? []}
            value={(danceTypes ?? []).find(dt => dt.id === formData.dance_type_id) ?? null}
            getOptionLabel={dt => dt.name}
            onChange={(_, value) => update('dance_type_id', value?.id ?? null)}
            renderInput={(params) => <TextField {...params} label='Dance Type' />}
          />
          <Autocomplete
            options={formations ?? []}
            value={(formations ?? []).find(f => f.id === formData.formation_id) ?? null}
            getOptionLabel={f => f.name}
            onChange={(_, value) => update('formation_id', value?.id ?? null)}
            renderInput={(params) => <TextField {...params} label='Formation' />}
          />
          <Autocomplete
            options={progressions ?? []}
            value={(progressions ?? []).find(p => p.id === formData.progression_id) ?? null}
            getOptionLabel={p => p.name}
            onChange={(_, value) => update('progression_id', value?.id ?? null)}
            renderInput={(params) => <TextField {...params} label='Progression' />}
          />

          <TextField
            label='Difficulty'
            type='number'
            value={formData.difficulty ?? ''}
            onChange={e => update('difficulty', e.target.value ? Number(e.target.value) : null)}
            fullWidth
          />
          <Tooltip title='Leave unchecked if unknown' placement='right'>
            <FormControlLabel
              label='16-beat swing?'
              control={
                <Checkbox
                  checked={Boolean(formData.swing_16)}
                  onChange={e => update('swing_16', e.target.checked)}
                />
              }
            />
          </Tooltip>

          <TextField label='Notes' value={formData.notes ?? ''} onChange={e => update('notes', e.target.value)} fullWidth multiline minRows={2} />
          <TextField label='Place in Program' value={formData.place_in_program ?? ''} onChange={e => update('place_in_program', e.target.value)} fullWidth multiline minRows={2} />
          <TextField label='Moves' value={formData.moves ?? ''} onChange={e => update('moves', e.target.value)} fullWidth multiline minRows={2} />

          <Divider />

          <RelationEditor
            model='choreographer' label='Choreographers'
            relations={dance?.dances_choreographers ?? []}
            getRelationId={dc => dc.choreographer.id}
            getRelationLabel={dc => dc.choreographer.name}
            options={choreographers ?? []}
            getOptionId={c => c.id}
            getOptionLabel={c => c.name}
            pending={pendingChoreographers}
          />
          <RelationEditor
            model='key_move' label='Key Moves'
            relations={dance?.dances_key_moves ?? []}
            getRelationId={dkm => dkm.key_move.id}
            getRelationLabel={dkm => dkm.key_move.name}
            options={keyMoves ?? []}
            getOptionId={km => km.id}
            getOptionLabel={km => km.name}
            pending={pendingKeyMoves}
          />
          <RelationEditor
            model='vibe' label='Vibes'
            relations={dance?.dances_vibes ?? []}
            getRelationId={dv => dv.vibe.id}
            getRelationLabel={dv => dv.vibe.name}
            options={vibes ?? []}
            getOptionId={v => v.id}
            getOptionLabel={v => v.name}
            pending={pendingVibes}
          />
        </Stack>
      )}

      {tab === 1 && (
        <FiguresEditor
          figures={pendingFigures.figures}
          onAdd={pendingFigures.addFigure}
          onUpdate={pendingFigures.updateFigure}
          onDelete={pendingFigures.deleteFigure}
        />
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button onClick={handleCancel} disabled={isSaving}>Cancel</Button>
        <Button variant='contained' startIcon={<SaveIcon />} onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : isCreate ? 'Create' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};
