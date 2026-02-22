import { useKeyMoves, useCreateKeyMove, useUpdateKeyMove, useDeleteKeyMove } from '@/hooks/useKeyMoves';
import { AuxiliaryList } from './AuxiliaryList';

export const KeyMovesList = () => {
  const { data, isLoading, error } = useKeyMoves();
  const { mutateAsync: create, isPending: isCreating } = useCreateKeyMove();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateKeyMove();
  const { mutateAsync: del } = useDeleteKeyMove();

  return (
    <AuxiliaryList
      title='Key Moves'
      singularLabel='key move'
      data={data}
      isLoading={isLoading}
      error={error}
      isSaving={isCreating || isUpdating}
      onCreate={(name) => create({ name })}
      onUpdate={(id, name) => update({ id, updates: { name } })}
      onDelete={(id) => del({ id })}
      getLinkedCount={(km) => km.dances_key_moves.length}
    />
  );
};
