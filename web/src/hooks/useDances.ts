import { useQuery } from '@tanstack/react-query'
import { getDances } from '../lib/api/dances'

export const useDances = () => {
  return useQuery({
    queryKey: ['dances'],
    queryFn: getDances,
  })
};
