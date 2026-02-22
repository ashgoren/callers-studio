import { supabase } from '@/lib/supabase'
import type { ProgressionRow } from '@/lib/types/database';

export const getProgressions = async () => {
  const { data, error } = await supabase
    .from('progressions')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as ProgressionRow[];
};
