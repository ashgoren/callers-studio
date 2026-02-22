import { useNotify } from '@/hooks/useNotify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const addChoreographerToDance = async (danceId: number, choreographerId: number) => {
  const { data, error } = await supabase
    .from('dances_choreographers')
    .insert({ dance_id: danceId, choreographer_id: choreographerId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const removeChoreographerFromDance = async (danceId: number, choreographerId: number) => {
  const { data, error } = await supabase
    .from('dances_choreographers')
    .delete()
    .eq('dance_id', danceId)
    .eq('choreographer_id', choreographerId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};


export const useAddChoreographerToDance = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, choreographerId }: { danceId: number; choreographerId: number }) =>
      addChoreographerToDance(danceId, choreographerId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error adding choreographer to dance')
  });
};

export const useRemoveChoreographerFromDance = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, choreographerId }: { danceId: number; choreographerId: number }) =>
      removeChoreographerFromDance(danceId, choreographerId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['choreographers'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error removing choreographer from dance')
  });
};
