import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/react-query';
import type { User } from '@supabase/supabase-js';

export const useRealtimeSync = (user: User | null) => {
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dances', filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'programs', filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'choreographers', filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);
};
