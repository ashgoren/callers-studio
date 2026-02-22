import { useNotify } from '@/hooks/useNotify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const addKeyMoveToDance = async (danceId: number, keyMoveId: number) => {
  const { data, error } = await supabase
    .from('dances_key_moves')
    .insert({ dance_id: danceId, key_move_id: keyMoveId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const removeKeyMoveFromDance = async (danceId: number, keyMoveId: number) => {
  const { data, error } = await supabase
    .from('dances_key_moves')
    .delete()
    .eq('dance_id', danceId)
    .eq('key_move_id', keyMoveId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};


export const useAddKeyMoveToDance = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, keyMoveId }: { danceId: number; keyMoveId: number }) =>
      addKeyMoveToDance(danceId, keyMoveId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['key_moves'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error adding key move to dance')
  });
};

export const useRemoveKeyMoveFromDance = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ danceId, keyMoveId }: { danceId: number; keyMoveId: number }) =>
      removeKeyMoveFromDance(danceId, keyMoveId),
    onSuccess: (_, { danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['dance', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      queryClient.invalidateQueries({ queryKey: ['key_moves'] });
    },
    onError: (err: Error) => toastError(err.message || 'Error removing key move from dance')
  });
};
