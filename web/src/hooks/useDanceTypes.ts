import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DanceTypeRow } from '@/lib/types/database';

export const useDanceTypes = () => {
  return useQuery({
    queryKey: ['dance_types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dance_types').select('*').order('sort_order', { ascending: true });
      if (error) throw new Error(error.message);
      return data as DanceTypeRow[];
    },
  });
};
