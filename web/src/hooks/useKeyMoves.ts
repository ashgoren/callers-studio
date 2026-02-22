import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { KeyMove, KeyMoveRow, KeyMoveInsert, KeyMoveUpdate } from '@/lib/types/database';

const getKeyMoves = async () => {
  const { data, error } = await supabase
    .from('key_moves')
    .select('*, dances_key_moves(id)')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as KeyMove[];
};

const createKeyMove = async (item: KeyMoveInsert) => {
  const { data, error } = await supabase.from('key_moves').insert(item).select('*').single();
  if (error) throw new Error(error.message);
  return data as KeyMoveRow;
};

const updateKeyMove = async (id: number, updates: KeyMoveUpdate) => {
  const { data, error } = await supabase.from('key_moves').update(updates).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data as KeyMoveRow;
};

const deleteKeyMove = async (id: number) => {
  const { error } = await supabase.from('key_moves').delete().eq('id', id);
  if (error) throw new Error(error.message);
};


export const useKeyMoves = () =>
  useQuery({ queryKey: ['key_moves'], queryFn: getKeyMoves });

export const useCreateKeyMove = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: KeyMoveInsert) => createKeyMove(item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['key_moves'] }); },
    onError: (err: Error) => toastError(err.message || 'Error creating key move'),
  });
};

export const useUpdateKeyMove = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: KeyMoveUpdate }) =>
      updateKeyMove(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['key_moves'] }); },
    onError: (err: Error) => toastError(err.message || 'Error updating key move'),
  });
};

export const useDeleteKeyMove = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteKeyMove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['key_moves'] }); },
    onError: (err: Error) => toastError(err.message || 'Error deleting key move'),
  });
};
