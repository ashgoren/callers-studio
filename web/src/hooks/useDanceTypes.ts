import { useQuery } from '@tanstack/react-query'
import { getDanceTypes } from '@/lib/api/danceTypes'

export const useDanceTypes = () => {
  return useQuery({
    queryKey: ['dance_types'],
    queryFn: getDanceTypes,
  });
};
