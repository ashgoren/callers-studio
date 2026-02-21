import { supabase } from '@/lib/supabase'
import type { Vibe, VibeRow, VibeInsert, VibeUpdate } from '@/lib/types/database';

export const getVibes = async () => {
  const { data, error } = await supabase
    .from('vibes')
    .select('*, dances_vibes(id)')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching vibes:', error);
    throw new Error(error.message);
  }
  return data as Vibe[];
};

export const updateVibe = async (id: number, updates: VibeUpdate) => {
  const { data, error } = await supabase
    .from('vibes')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as VibeRow;
};

export const createVibe = async (newVibe: VibeInsert) => {
  const { data, error } = await supabase
    .from('vibes')
    .insert(newVibe)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as VibeRow;
};

export const deleteVibe = async (id: number) => {
  const { error } = await supabase
    .from('vibes')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
