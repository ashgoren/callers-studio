import { supabase } from '@/lib/supabase'

export const getPrograms = async () => {
  const { data, error } = await supabase.from('programs').select('*');

  if (error) {
    throw new Error(error.message);
  }

  // console.log('Fetched programs:', data);
  return data;
};