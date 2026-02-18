import { useNotify } from '@/hooks/useNotify';
import { useDance, useCreateDance, useUpdateDance, useDeleteDance } from '@/hooks/useDances';
import { useAddChoreographerToDance, useRemoveChoreographerFromDance } from '@/hooks/useDancesChoreographers';
import { useChoreographers } from '@/hooks/useChoreographers';
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

  const { data: dance, isLoading, error } = useDance(Number(id));
  const { data: choreographers } = useChoreographers();

  const pending = usePendingRelations();

  const handleSave = async (updates: DanceUpdate) => {
    const { id: danceId } = mode === 'create'
      ? await createDance(updates as DanceInsert)
      : await updateDance({ id: dance!.id, updates });

    const { added, removed } = await pending.commitChanges(
      (choreographerId) => addChoreographer({ danceId, choreographerId }),
      (choreographerId) => removeChoreographer({ danceId, choreographerId })
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
          ...relationOps('dances_choreographers', added, [])
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
          ...relationOps('dances_choreographers', added, removed)
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
        hasPendingRelationChanges={pending.hasPendingChanges}
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
          pending={pending}
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
        hasPendingRelationChanges={pending.hasPendingChanges}
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
          pending={pending}
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
    </RecordView>
  );
};
