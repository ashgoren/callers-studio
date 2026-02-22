import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Vibe, VibeRow, VibeInsert, VibeUpdate } from '@/lib/types/database';

const getVibes = async () => {
  const { data, error } = await supabase
    .from('vibes')
    .select('*, dances_vibes(id)')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Vibe[];
};

const createVibe = async (item: VibeInsert) => {
  const { data, error } = await supabase.from('vibes').insert(item).select('*').single();
  if (error) throw new Error(error.message);
  return data as VibeRow;
};

const updateVibe = async (id: number, updates: VibeUpdate) => {
  const { data, error } = await supabase.from('vibes').update(updates).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data as VibeRow;
};

const deleteVibe = async (id: number) => {
  const { error } = await supabase.from('vibes').delete().eq('id', id);
  if (error) throw new Error(error.message);
};


export const useVibes = () =>
  useQuery({ queryKey: ['vibes'], queryFn: getVibes });

export const useCreateVibe = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: VibeInsert) => createVibe(item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vibes'] }); },
    onError: (err: Error) => toastError(err.message || 'Error creating vibe'),
  });
};

export const useUpdateVibe = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: VibeUpdate }) =>
      updateVibe(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vibes'] }); },
    onError: (err: Error) => toastError(err.message || 'Error updating vibe'),
  });
};

export const useDeleteVibe = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteVibe(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vibes'] }); },
    onError: (err: Error) => toastError(err.message || 'Error deleting vibe'),
  });
};
