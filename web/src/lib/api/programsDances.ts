import { supabase } from '@/lib/supabase'

export const addDanceToProgram = async (programId: number, danceId: number, order: number) => {
  const { data, error } = await supabase
    .from('programs_dances')
    .insert({ program_id: programId, dance_id: danceId, order })
    .select()
    .single()

  if (error) throw new Error(error.message);
  return data;
};

export const removeDanceFromProgram = async (programId: number, danceId: number) => {
  const { data, error } = await supabase
    .from('programs_dances')
    .delete()
    .eq('program_id', programId)
    .eq('dance_id', danceId)
    .select()
    .single()

  if (error) throw new Error(error.message);
  return data;
};
