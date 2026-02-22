import { useQuery } from '@tanstack/react-query'
import { getFormations } from '@/lib/api/formations'

export const useFormations = () => {
  return useQuery({
    queryKey: ['formations'],
    queryFn: getFormations,
  });
};
