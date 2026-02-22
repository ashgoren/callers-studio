import { useQuery } from '@tanstack/react-query'
import { getProgressions } from '@/lib/api/progressions'

export const useProgressions = () => {
  return useQuery({
    queryKey: ['progressions'],
    queryFn: getProgressions,
  });
};
