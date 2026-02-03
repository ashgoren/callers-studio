import { useDance, useCreateDance, useUpdateDance, useDeleteDance } from '@/hooks/useDances';
import { Spinner, ErrorMessage } from '@/components/shared';
import { columns, newRecord } from './config';
import { RecordView } from '@/components/RecordView';
import { RecordEdit } from '@/components/RecordEdit';
import { RelationList } from '@/components/RelationList';
import { useDrawerState, useDrawerActions } from '@/contexts/DrawerContext';
import type { DanceInsert, DanceUpdate } from '@/lib/types/database';

export const Dance = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { setMode, closeDrawer } = useDrawerActions();
  const { mutateAsync: createDance } = useCreateDance();
  const { mutateAsync: updateDance } = useUpdateDance();
  const { mutateAsync: deleteDance } = useDeleteDance();
  const { data: dance, isLoading, error } = useDance(Number(id));

  if (mode === 'create') {
    return (
      <RecordEdit
        data={newRecord}
        columns={columns}
        title={'New Dance'}
        onSave={(data: DanceInsert) => createDance(data)}
        hasPendingRelationChanges={false}
        onCancel={() => closeDrawer()}
      />
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
        onSave={(updates: DanceUpdate) => updateDance({ id: id!, updates })}
        hasPendingRelationChanges={false}
        onCancel={() => setMode('view')}
      />
    );
  }

  return (
    <RecordView
      data={dance}
      columns={columns}
      title={`Dance: ${dance.title}`}
      onEdit={() => setMode('edit')}
      onDelete={() => deleteDance({ id: id! })}
    >
      <RelationList
        model='program'
        label='🔗 Programs'
        relations={dance.programs_dances}
        getRelationId={(pd) => pd.program.id}
        getRelationLabel={(pd) => `${pd.program.date} - ${pd.program.location}`}
      />
    </RecordView>
  );
};
