import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVibes, createVibe, updateVibe, deleteVibe } from '@/lib/api/vibes';
import type { VibeInsert, VibeUpdate } from '@/lib/types/database';

export const useVibes = () => {
  return useQuery({
    queryKey: ['vibes'],
    queryFn: getVibes,
  })
};

export const useCreateVibe = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVibe: VibeInsert) => createVibe(newVibe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error creating vibe')
  });
};

export const useUpdateVibe = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: VibeUpdate }) =>
      updateVibe(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error updating vibe')
  });
};

export const useDeleteVibe = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteVibe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error deleting vibe')
  });
};
