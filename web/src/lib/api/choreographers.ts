import { supabase } from '@/lib/supabase'
import type { Choreographer, ChoreographerInsert, ChoreographerUpdate } from '@/lib/types/database';

export const getChoreographers = async () => {
  const { data, error } = await supabase
    .from('choreographers')
    .select('*');

  if (error) {
    console.error('Error fetching choreographers:', error);
    throw new Error(error.message);
  }
  return data as Choreographer[];
};

export const getChoreographer = async (id: number) => {
  const { data, error } = await supabase
    .from('choreographers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Choreographer;
};

export const updateChoreographer = async (id: number, updates: ChoreographerUpdate) => {
  const { data, error } = await supabase
    .from('choreographers')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Choreographer;
};

export const createChoreographer = async (newChoreographer: ChoreographerInsert) => {
  const { data, error } = await supabase
    .from('choreographers')
    .insert(newChoreographer)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Choreographer;
};

export const deleteChoreographer = async (id: number) => {
  const { error } = await supabase
    .from('choreographers')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
