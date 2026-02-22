import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Choreographer, ChoreographerRow, ChoreographerInsert, ChoreographerUpdate } from '@/lib/types/database';

const getChoreographers = async () => {
  const { data, error } = await supabase
    .from('choreographers')
    .select('*, dances_choreographers(id)')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Choreographer[];
};

const createChoreographer = async (item: ChoreographerInsert) => {
  const { data, error } = await supabase.from('choreographers').insert(item).select('*').single();
  if (error) throw new Error(error.message);
  return data as ChoreographerRow;
};

const updateChoreographer = async (id: number, updates: ChoreographerUpdate) => {
  const { data, error } = await supabase.from('choreographers').update(updates).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data as ChoreographerRow;
};

const deleteChoreographer = async (id: number) => {
  const { error } = await supabase.from('choreographers').delete().eq('id', id);
  if (error) throw new Error(error.message);
};


export const useChoreographers = () =>
  useQuery({ queryKey: ['choreographers'], queryFn: getChoreographers });

export const useCreateChoreographer = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: ChoreographerInsert) => createChoreographer(item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['choreographers'] }); },
    onError: (err: Error) => toastError(err.message || 'Error creating choreographer'),
  });
};

export const useUpdateChoreographer = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ChoreographerUpdate }) =>
      updateChoreographer(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['choreographers'] }); },
    onError: (err: Error) => toastError(err.message || 'Error updating choreographer'),
  });
};

export const useDeleteChoreographer = () => {
  const { toastError } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteChoreographer(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['choreographers'] }); },
    onError: (err: Error) => toastError(err.message || 'Error deleting choreographer'),
  });
};
