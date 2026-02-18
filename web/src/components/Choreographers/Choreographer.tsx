import { useNotify } from '@/hooks/useNotify';
import { useChoreographer, useCreateChoreographer, useUpdateChoreographer, useDeleteChoreographer } from '@/hooks/useChoreographers';
import { Spinner, ErrorMessage } from '@/components/shared';
import { columns, newRecord } from './config';
import { RecordView } from '@/components/RecordView';
import { RecordEdit } from '@/components/RecordEdit';
import { RelationList } from '@/components/RelationList';
import { useDrawerState } from '@/contexts/DrawerContext';
import { useUndoActions, dbRecord, beforeValues, relationOps } from '@/contexts/UndoContext';
import type { ChoreographerInsert, ChoreographerUpdate } from '@/lib/types/database';

export const Choreographer = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { pushAction } = useUndoActions();
  const { toastSuccess } = useNotify();

  const { mutateAsync: createChoreographer } = useCreateChoreographer();
  const { mutateAsync: updateChoreographer } = useUpdateChoreographer();
  const { mutateAsync: deleteChoreographer } = useDeleteChoreographer();

  const { data: choreographer, isLoading, error } = useChoreographer(Number(id));

  const handleSave = async (updates: ChoreographerUpdate) => {
    if (mode === 'create') {
      const { id: choreographerId } = await createChoreographer(updates as ChoreographerInsert);
      pushAction({
        label: `Create Choreographer: ${updates.name}`,
        ops: [
          {
            type: 'insert',
            table: 'choreographers',
            record: { id: choreographerId, ...updates }
          }
        ]
      });
      toastSuccess('Choreographer created');
    } else {
      await updateChoreographer({ id: choreographer!.id, updates });
      pushAction({
        label: `Edit Choreographer: ${updates.name}`,
        ops: [
          {
            type: 'update',
            table: 'choreographers',
            id: choreographer!.id,
            before: beforeValues(choreographer!, updates, newRecord),
            after: dbRecord(updates, newRecord)
          }
        ]
      });
      toastSuccess('Choreographer updated');
    }
  };

  const handleDelete = async () => {
    if (!choreographer) return;
    await deleteChoreographer({ id: choreographer.id });
    pushAction({
      label: `Delete Choreographer: ${choreographer.name}`,
      ops: [
        {
          type: 'delete',
          table: 'choreographers',
          id: choreographer.id,
          record: dbRecord(choreographer, newRecord)
        },
        ...relationOps(
          'dances_choreographers',
          [],
          choreographer.dances_choreographers.map(dc => ({ id: dc.id, dance_id: dc.dance.id, choreographer_id: choreographer.id }))
        )
      ]
    });
    toastSuccess('Choreographer deleted');
  };

  if (mode === 'create') {
    return (
      <RecordEdit
        data={newRecord}
        columns={columns}
        title={'New Choreographer'}
        onSave={handleSave}
        hasPendingRelationChanges={false}
      />
    );
  }

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!choreographer) return <ErrorMessage error={new Error('Choreographer not found')} />;

  if (mode === 'edit') {
    return (
      <RecordEdit
        data={choreographer}
        columns={columns}
        title={choreographer.name}
        onSave={handleSave}
        hasPendingRelationChanges={false}
      />
    );
  }

  return (
    <RecordView
      data={choreographer}
      columns={columns}
      title={`Choreographer: ${choreographer.name}`}
      onDelete={handleDelete}
    >
      <RelationList
        model='dance'
        label='🔗 Dances'
        relations={choreographer.dances_choreographers}
        getRelationId={(dc => dc.dance.id)}
        getRelationLabel={(dc) => dc.dance.title}
      />
    </RecordView>
  );
};
