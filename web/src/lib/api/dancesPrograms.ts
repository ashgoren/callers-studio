import { supabase } from '../supabase'

export const getDancesPrograms = async () => {
  const { data, error } = await supabase.from('dancesPrograms').select('*');

  if (error) {
    throw new Error(error.message);
  }

  console.log('Fetched dances_programs:', data);
  return data;
};