import { useVibes, useCreateVibe, useUpdateVibe, useDeleteVibe } from '@/hooks/useVibes';
import { AuxiliaryList } from './AuxiliaryList';

export const VibesList = () => {
  const { data, isLoading, error } = useVibes();
  const { mutateAsync: create, isPending: isCreating } = useCreateVibe();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateVibe();
  const { mutateAsync: del } = useDeleteVibe();

  return (
    <AuxiliaryList
      title='Vibes'
      singularLabel='vibe'
      data={data}
      isLoading={isLoading}
      error={error}
      isSaving={isCreating || isUpdating}
      onCreate={(name) => create({ name })}
      onUpdate={(id, name) => update({ id, updates: { name } })}
      onDelete={(id) => del({ id })}
      getLinkedCount={(v) => v.dances_vibes.length}
    />
  );
};
