import { useChoreographers, useCreateChoreographer, useUpdateChoreographer, useDeleteChoreographer } from '@/hooks/useChoreographers';
import { AuxiliaryList } from './AuxiliaryList';

export const ChoreographersList = () => {
  const { data, isLoading, error } = useChoreographers();
  const { mutateAsync: create, isPending: isCreating } = useCreateChoreographer();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateChoreographer();
  const { mutateAsync: del } = useDeleteChoreographer();

  return (
    <AuxiliaryList
      title='Choreographers'
      singularLabel='choreographer'
      data={data}
      isLoading={isLoading}
      error={error}
      isSaving={isCreating || isUpdating}
      onCreate={(name) => create({ name })}
      onUpdate={(id, name) => update({ id, updates: { name } })}
      onDelete={(id) => del({ id })}
      getLinkedCount={(c) => c.dances_choreographers.length}
    />
  );
};
