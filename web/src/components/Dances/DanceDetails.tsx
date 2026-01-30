import { useUpdateDance } from '@/hooks/useDances';
import { Spinner, ErrorMessage } from '@/components/shared';
import { useDance } from '@/hooks/useDances';
import { columns } from './columns';
import { DetailPanel } from '@/components/DetailPanel';
import { EditPanel } from '@/components/EditPanel';
import { useDrawerState, useDrawerActions } from '@/contexts/DrawerContext';
import type { DanceUpdate } from '@/lib/types/database';

export const DanceDetails = ({ id }: { id: number }) => {
  const { isEditing } = useDrawerState();
  const { setIsEditing } = useDrawerActions();
  const { mutateAsync: updateDance } = useUpdateDance();
  const { data: dance, isLoading, error } = useDance(Number(id));

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!dance) return <ErrorMessage error={new Error('Dance not found')} />;

  if (isEditing) {
    return (
      <EditPanel
        data={dance}
        columns={columns}
        title={`Edit: ${dance.title}`}
        onSave={(updates: DanceUpdate) => updateDance({ id, updates })}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <DetailPanel
      data={dance}
      columns={columns}
      title={`Dance: ${dance.title}`}
      onEdit={() => setIsEditing(true)}
    />
  );
};
