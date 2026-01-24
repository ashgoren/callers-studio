import { useQuery } from '@tanstack/react-query'
import { getPrograms } from '../lib/api/programs'

export const usePrograms = () => {
  return useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms,
  })
};