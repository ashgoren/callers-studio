import { useQuery } from '@tanstack/react-query'
import { getDancesPrograms } from '../lib/api/dancesPrograms'

export const useDancesPrograms = () => {
  return useQuery({
    queryKey: ['dancesPrograms'],
    queryFn: getDancesPrograms,
  })
};