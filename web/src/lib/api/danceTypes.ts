import { supabase } from '@/lib/supabase'
import type { DanceTypeRow } from '@/lib/types/database';

export const getDanceTypes = async () => {
  const { data, error } = await supabase
    .from('dance_types')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as DanceTypeRow[];
};
