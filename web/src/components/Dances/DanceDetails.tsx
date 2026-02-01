import { useCreateDance, useUpdateDance, useDeleteDance } from '@/hooks/useDances';
import { Spinner, ErrorMessage } from '@/components/shared';
import { useDance } from '@/hooks/useDances';
import { columns, newRecord } from './columns';
import { DetailPanel } from '@/components/DetailPanel';
import { EditPanel } from '@/components/EditPanel';
import { useDrawerState, useDrawerActions } from '@/contexts/DrawerContext';
import type { DanceInsert, DanceUpdate } from '@/lib/types/database';

export const DanceDetails = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { setMode, closeDrawer } = useDrawerActions();
  const { mutateAsync: createDance } = useCreateDance();
  const { mutateAsync: updateDance } = useUpdateDance();
  const { mutateAsync: deleteDance } = useDeleteDance();
  const { data: dance, isLoading, error } = useDance(Number(id));

  if (mode === 'create') {
    return (
      <EditPanel
      data={newRecord}
      columns={columns}
      title={'New Dance'}
      onSave={(data: DanceInsert) => createDance(data)}
      onCancel={() => closeDrawer()}
      />
    );
  }

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!dance) return <ErrorMessage error={new Error('Dance not found')} />;

  if (mode === 'edit') {
    return (
      <EditPanel
        data={dance}
        columns={columns}
        title={`Edit: ${dance.title}`}
        onSave={(updates: DanceUpdate) => updateDance({ id: id!, updates })}
        onCancel={() => setMode('view')}
      />
    );
  }

  return (
    <DetailPanel
      data={dance}
      columns={columns}
      title={`Dance: ${dance.title}`}
      onEdit={() => setMode('edit')}
      onDelete={() => deleteDance({ id: id! })}
    />
  );
};
