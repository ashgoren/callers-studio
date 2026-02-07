import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChoreographers, getChoreographer, createChoreographer, updateChoreographer, deleteChoreographer } from '@/lib/api/choreographers'
import type { ChoreographerInsert, ChoreographerUpdate } from '@/lib/types/database';

export const useChoreographers = () => {
  return useQuery({
    queryKey: ['choreographers'],
    queryFn: getChoreographers,
  })
};

export const useChoreographer = (id: number) => {
  return useQuery({
    queryKey: ['choreographer', id],
    queryFn: () => getChoreographer(id),
    enabled: !!id,
  })
};

export const useCreateChoreographer = () => {
  const { success, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newChoreographer: ChoreographerInsert) => createChoreographer(newChoreographer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
      success('Choreographer created');
    },
    onError: (err: Error) => error(err.message || 'Error creating choreographer')
  });
};

export const useUpdateChoreographer = () => {
  const { success, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ChoreographerUpdate }) =>
      updateChoreographer(id, updates),
    onSuccess: (updatedChoreographer, variables) => {
      queryClient.setQueryData(['choreographer', variables.id], updatedChoreographer);
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
      success('Choreographer updated');
    },
    onError: (err: Error) => error(err.message || 'Error updating choreographer')
  });
};

export const useDeleteChoreographer = () => {
  const { info, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteChoreographer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
      info('Choreographer deleted');
    },
    onError: (err: Error) => error(err.message || 'Error deleting choreographer')
  });
};
