import { useQuery } from '@tanstack/react-query'
import { getPrograms } from '@/lib/api/programs'
import type { Program } from '@/lib/types/database';

export const usePrograms = () => {
  return useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms,
    select: data => data.map((program: Program) => ({
      ...program,
      danceNames: program.programs_dances.map(pd => pd.dance.title).join(', ')
    })),
  })
};