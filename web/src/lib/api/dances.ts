import { supabase } from '../supabase'

export const getDances = async () => {
  const { data, error } = await supabase.from('dances').select('*');

  if (error) {
    throw new Error(error.message);
  }

  console.log('Fetched dances:', data);
  return data;
};