import { useNotify } from '@/hooks/useNotify';
import { useDance, useCreateDance, useUpdateDance, useDeleteDance } from '@/hooks/useDances';
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
import { RelationEditor } from '@/components/RelationEditor';
import { Spinner, ErrorMessage } from '@/components/shared';
import { columns, newRecord } from './config';
import { RecordView } from '@/components/RecordView';
import { RecordEdit } from '@/components/RecordEdit';
import { RelationList } from '@/components/RelationList';
import { useDrawerState } from '@/contexts/DrawerContext';
import { useUndoActions, dbRecord, beforeValues, relationOps } from '@/contexts/UndoContext';
import type { DanceInsert, DanceUpdate, Dance as DanceType } from '@/lib/types/database';

export const Dance = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { pushAction } = useUndoActions();
  const { toastSuccess } = useNotify();

  const { mutateAsync: createDance } = useCreateDance();
  const { mutateAsync: updateDance } = useUpdateDance();
  const { mutateAsync: deleteDance } = useDeleteDance();
  const { mutateAsync: addChoreographer } = useAddChoreographerToDance();
  const { mutateAsync: removeChoreographer } = useRemoveChoreographerFromDance();
  const { mutateAsync: addKeyMove } = useAddKeyMoveToDance();
  const { mutateAsync: removeKeyMove } = useRemoveKeyMoveFromDance();
  const { mutateAsync: addVibe } = useAddVibeToDance();
  const { mutateAsync: removeVibe } = useRemoveVibeFromDance();

  const { data: dance, isLoading, error } = useDance(Number(id));
  const { data: choreographers } = useChoreographers();
  const { data: keyMoves } = useKeyMoves();
  const { data: vibes } = useVibes();
  const { data: danceTypes } = useDanceTypes();
  const { data: formations } = useFormations();
  const { data: progressions } = useProgressions();

  const selectOptions = {
    dance_type_id: (danceTypes ?? []).map(dt => ({ value: dt.id, label: dt.name })),
    formation_id: (formations ?? []).map(f => ({ value: f.id, label: f.name })),
    progression_id: (progressions ?? []).map(p => ({ value: p.id, label: p.name })),
  };

  const pendingChoreographers = usePendingRelations();
  const pendingKeyMoves = usePendingRelations();
  const pendingVibes = usePendingRelations();

  const handleSave = async (updates: DanceUpdate) => {
    const { id: danceId } = mode === 'create'
      ? await createDance(updates as DanceInsert)
      : await updateDance({ id: dance!.id, updates });

    const { added: addedChoreographers, removed: removedChoreographers } = await pendingChoreographers.commitChanges(
      (choreographerId) => addChoreographer({ danceId, choreographerId }),
      (choreographerId) => removeChoreographer({ danceId, choreographerId })
    );

    const { added: addedKeyMoves, removed: removedKeyMoves } = await pendingKeyMoves.commitChanges(
      (keyMoveId) => addKeyMove({ danceId, keyMoveId }),
      (keyMoveId) => removeKeyMove({ danceId, keyMoveId })
    );

    const { added: addedVibes, removed: removedVibes } = await pendingVibes.commitChanges(
      (vibeId) => addVibe({ danceId, vibeId }),
      (vibeId) => removeVibe({ danceId, vibeId })
    );

    if (mode === 'create') {
      pushAction({
        label: `Create Dance: ${updates.title}`,
        ops: [
          {
            type: 'insert',
            table: 'dances',
            record: { id: danceId, ...updates }
          },
          ...relationOps('dances_choreographers', addedChoreographers, []),
          ...relationOps('dances_key_moves', addedKeyMoves, []),
          ...relationOps('dances_vibes', addedVibes, [])
        ]
      });
      toastSuccess('Dance created');
    }

    if (mode === 'edit') {
      pushAction({
        label: `Edit Dance: ${updates.title}`,
        ops: [
          {
            type: 'update',
            table: 'dances',
            id: danceId,
            before: beforeValues(dance!, updates, newRecord),
            after: dbRecord(updates, newRecord)
          },
          ...relationOps('dances_choreographers', addedChoreographers, removedChoreographers),
          ...relationOps('dances_key_moves', addedKeyMoves, removedKeyMoves),
          ...relationOps('dances_vibes', addedVibes, removedVibes)
        ]
      });
      toastSuccess('Dance updated');
    }
  };

  const handleDelete = async () => {
    if (!dance) return;
    await deleteDance({ id: dance.id });
    pushAction({
      label: `Delete Dance: ${dance.title}`,
      ops: [
        { type: 'delete', table: 'dances', id: dance.id, record: dbRecord(dance, newRecord) },
        ...relationOps('dances_choreographers', [],
          dance.dances_choreographers.map(dc => ({
            id: dc.id, dance_id: dance.id, choreographer_id: dc.choreographer.id
          }))),
        ...relationOps('dances_key_moves', [],
          dance.dances_key_moves.map(dkm => ({
            id: dkm.id, dance_id: dance.id, key_move_id: dkm.key_move.id
          }))),
        ...relationOps('dances_vibes', [],
          dance.dances_vibes.map(dv => ({
            id: dv.id, dance_id: dance.id, vibe_id: dv.vibe.id
          }))),
        ...relationOps('programs_dances', [],
          dance.programs_dances.map(pd => ({
            id: pd.id, dance_id: dance.id, program_id: pd.program.id, order: pd.order
          })))
      ]
    });
    toastSuccess('Dance deleted');
  };

  if (mode === 'create') {
    return (
      <RecordEdit
        data={newRecord}
        columns={columns}
        title={'New Dance'}
        onSave={handleSave}
        hasPendingRelationChanges={pendingChoreographers.hasPendingChanges || pendingKeyMoves.hasPendingChanges || pendingVibes.hasPendingChanges}
        selectOptions={selectOptions}
      >
        <RelationEditor
          model='choreographer'
          label='Choreographers'
          relations={[] as DanceType['dances_choreographers']}
          getRelationId={dc => dc.choreographer.id}
          getRelationLabel={dc => dc.choreographer.name}
          options={choreographers ?? []}
          getOptionLabel={choreographer => choreographer.name}
          getOptionId={choreographer => choreographer.id}
          pending={pendingChoreographers}
        />
        <RelationEditor
          model='key_move'
          label='Key Moves'
          relations={[] as DanceType['dances_key_moves']}
          getRelationId={dkm => dkm.key_move.id}
          getRelationLabel={dkm => dkm.key_move.name}
          options={keyMoves ?? []}
          getOptionLabel={keyMove => keyMove.name}
          getOptionId={keyMove => keyMove.id}
          pending={pendingKeyMoves}
        />
        <RelationEditor
          model='vibe'
          label='Vibes'
          relations={[] as DanceType['dances_vibes']}
          getRelationId={dv => dv.vibe.id}
          getRelationLabel={dv => dv.vibe.name}
          options={vibes ?? []}
          getOptionLabel={vibe => vibe.name}
          getOptionId={vibe => vibe.id}
          pending={pendingVibes}
        />
      </RecordEdit>
    );
  }

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!dance) return <ErrorMessage error={new Error('Dance not found')} />;

  if (mode === 'edit') {
    return (
      <RecordEdit
        data={dance}
        columns={columns}
        title={`Edit: ${dance.title}`}
        onSave={handleSave}
        hasPendingRelationChanges={pendingChoreographers.hasPendingChanges || pendingKeyMoves.hasPendingChanges || pendingVibes.hasPendingChanges}
        selectOptions={selectOptions}
      >
        <RelationEditor
          model='choreographer'
          label='Choreographers'
          relations={dance.dances_choreographers}
          getRelationId={dc => dc.choreographer.id}
          getRelationLabel={dc => dc.choreographer.name}
          options={choreographers ?? []}
          getOptionId={choreographer => choreographer.id}
          getOptionLabel={choreographer => choreographer.name}
          pending={pendingChoreographers}
        />
        <RelationEditor
          model='key_move'
          label='Key Moves'
          relations={dance.dances_key_moves}
          getRelationId={dkm => dkm.key_move.id}
          getRelationLabel={dkm => dkm.key_move.name}
          options={keyMoves ?? []}
          getOptionLabel={keyMove => keyMove.name}
          getOptionId={keyMove => keyMove.id}
          pending={pendingKeyMoves}
        />
        <RelationEditor
          model='vibe'
          label='Vibes'
          relations={dance.dances_vibes}
          getRelationId={dv => dv.vibe.id}
          getRelationLabel={dv => dv.vibe.name}
          options={vibes ?? []}
          getOptionLabel={vibe => vibe.name}
          getOptionId={vibe => vibe.id}
          pending={pendingVibes}
        />
      </RecordEdit>
    );
  }

  return (
    <RecordView
      data={dance}
      columns={columns}
      title={`Dance: ${dance.title}`}
      onDelete={handleDelete}
    >
      <RelationList
        model='program'
        label='🔗 Programs'
        relations={dance.programs_dances}
        getRelationId={(pd) => pd.program.id}
        getRelationLabel={(pd) => `${pd.program.date} - ${pd.program.location}`}
      />
      <RelationList
        model='choreographer'
        label='🔗 Choreographers'
        relations={dance.dances_choreographers}
        getRelationId={(dc) => dc.choreographer.id}
        getRelationLabel={(dc) => dc.choreographer.name}
      />
      <RelationList
        model='key_move'
        label='🔗 Key Moves'
        relations={dance.dances_key_moves}
        getRelationId={(dkm) => dkm.key_move.id}
        getRelationLabel={(dkm) => dkm.key_move.name}
      />
      <RelationList
        model='vibe'
        label='🔗 Vibes'
        relations={dance.dances_vibes}
        getRelationId={(dv) => dv.vibe.id}
        getRelationLabel={(dv) => dv.vibe.name}
      />
    </RecordView>
  );
};
