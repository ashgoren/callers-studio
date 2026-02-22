import { useNotify } from '@/hooks/useNotify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const addVibeToDance = async (danceId: number, vibeId: number) => {
  const { data, error } = await supabase
    .from('dances_vibes')
    .insert({ dance_id: danceId, vibe_id: vibeId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const removeVibeFromDance = async (danceId: number, vibeId: number) => {
  const { data, error } = await supabase
    .from('dances_vibes')
    .delete()
    .eq('dance_id', danceId)
    .eq('vibe_id', vibeId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};


export const useAddVibeToDance = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, vibeId }: { danceId: number; vibeId: number }) =>
      addVibeToDance(danceId, vibeId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error adding vibe to dance')
  });
};

export const useRemoveVibeFromDance = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, vibeId }: { danceId: number; vibeId: number }) =>
      removeVibeFromDance(danceId, vibeId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error removing vibe from dance')
  });
};
