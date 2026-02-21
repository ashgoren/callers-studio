import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChoreographers, createChoreographer, updateChoreographer, deleteChoreographer } from '@/lib/api/choreographers'
import type { ChoreographerInsert, ChoreographerUpdate } from '@/lib/types/database';

export const useChoreographers = () => {
  return useQuery({
    queryKey: ['choreographers'],
    queryFn: getChoreographers,
  })
};

export const useCreateChoreographer = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newChoreographer: ChoreographerInsert) => createChoreographer(newChoreographer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error creating choreographer')
  });
};

export const useUpdateChoreographer = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ChoreographerUpdate }) =>
      updateChoreographer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['dance'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error updating choreographer')
  });
};

export const useDeleteChoreographer = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteChoreographer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['dance'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error deleting choreographer')
  });
};
