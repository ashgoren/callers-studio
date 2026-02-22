import { supabase } from '@/lib/supabase'
import type { FormationRow } from '@/lib/types/database';

export const getFormations = async () => {
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as FormationRow[];
};
