import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getKeyMoves, createKeyMove, updateKeyMove, deleteKeyMove } from '@/lib/api/keyMoves'
import type { KeyMoveInsert, KeyMoveUpdate } from '@/lib/types/database';

export const useKeyMoves = () => {
  return useQuery({
    queryKey: ['key_moves'],
    queryFn: getKeyMoves,
  })
};

export const useCreateKeyMove = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newKeyMove: KeyMoveInsert) => createKeyMove(newKeyMove),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key_moves'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error creating key move')
  });
};

export const useUpdateKeyMove = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: KeyMoveUpdate }) =>
      updateKeyMove(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key_moves'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error updating key move')
  });
};

export const useDeleteKeyMove = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteKeyMove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key_moves'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error deleting key move')
  });
};
