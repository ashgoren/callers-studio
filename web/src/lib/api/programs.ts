import { supabase } from '@/lib/supabase'
import type { Program, ProgramInsert, ProgramUpdate } from '@/lib/types/database';

export const getPrograms = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, programs_dances(order, dance:dances(*))')
    .order('order', { referencedTable: 'programs_dances', ascending: true });

  if (error) throw new Error(error.message);
  return data as Program[];
};

export const getProgram = async (id: number) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, programs_dances(order, dance:dances(*))')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Program;
};

export const updateProgram = async (id: number, updates: ProgramUpdate) => {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', id)
    .select('*, programs_dances(order, dance:dances(*))')
    .single();

  if (error) throw new Error(error.message);
  return data as Program;
};

export const createProgram = async (newProgram: ProgramInsert) => {
  const { data, error } = await supabase
    .from('programs')
    .insert(newProgram)
    .select('*, programs_dances(order, dance:dances(*))')
    .single();

  if (error) throw new Error(error.message);
  return data as Program;
};

export const deleteProgram = async (id: number) => {
  const { data, error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return data;
};
