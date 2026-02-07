import { useNotify } from '@/hooks/useNotify';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addChoreographerToDance, removeChoreographerFromDance } from '@/lib/api/dancesChoreographers';

export const useAddChoreographerToDance = () => {
  const { error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, choreographerId }: { danceId: number; choreographerId: number }) =>
      addChoreographerToDance(danceId, choreographerId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      // success('Choreographer added to dance');
    },
    onError: (err: Error) => error(err.message || 'Error adding choreographer to dance')
  });
};

export const useRemoveChoreographerFromDance = () => {
  const { error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, choreographerId }: { danceId: number; choreographerId: number }) =>
      removeChoreographerFromDance(danceId, choreographerId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      // info('Choreographer removed from dance');
    },
    onError: (err: Error) => error(err.message || 'Error removing choreographer from dance')
  });
};
