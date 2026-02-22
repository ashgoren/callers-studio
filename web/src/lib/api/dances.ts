import { supabase } from '@/lib/supabase'
import type { Dance, DanceInsert, DanceUpdate } from '@/lib/types/database';

const DANCE_SELECT = '*, programs_dances(id, order, program:programs(*)), dances_choreographers(id, choreographer:choreographers(*)), dances_key_moves(id, key_move:key_moves(*)), dances_vibes(id, vibe:vibes(*)), dance_type:dance_types(id, name, sort_order), formation:formations(id, name, sort_order), progression:progressions(id, name, sort_order)';

export const getDances = async () => {
  const { data, error } = await supabase
    .from('dances')
    .select(DANCE_SELECT)

  if (error) {
    console.error('Error fetching dances:', error);
    throw new Error(error.message);
  }
  return data as Dance[];
};

export const getDance = async (id: number) => {
  const { data, error } = await supabase
    .from('dances')
    .select(DANCE_SELECT)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Dance;
};

export const updateDance = async (id: number, updates: DanceUpdate) => {
  const { data, error } = await supabase
    .from('dances')
    .update(updates)
    .eq('id', id)
    .select(DANCE_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as Dance;
};

export const createDance = async (newDance: DanceInsert) => {
  const { data, error } = await supabase
    .from('dances')
    .insert(newDance)
    .select(DANCE_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as Dance;
};

export const deleteDance = async (id: number) => {
  const { error } = await supabase
    .from('dances')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
