import { supabase } from '@/lib/supabase'

export const getPrograms = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, programs_dances(order, dance:dances(*))')
    .order('order', { referencedTable: 'programs_dances', ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // console.log('Fetched programs:', data);
  return data;
};