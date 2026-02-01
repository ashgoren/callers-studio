import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDances, getDance, updateDance, createDance, deleteDance } from '@/lib/api/dances'
import type { Dance, DanceUpdate, DanceInsert } from '@/lib/types/database';

export const useDances = () => {
  return useQuery({
    queryKey: ['dances'],
    queryFn: getDances,
    select: ((data: Dance[]) => data.map(buildDancesColumn))
  });
};

export const useDance = (id: number) => {
  return useQuery({
    queryKey: ['dance', id],
    queryFn: () => getDance(id),
    enabled: !!id,
    select: (data: Dance) => buildDancesColumn(data)
  })
};

export const useUpdateDance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: DanceUpdate }) =>
      updateDance(id, updates),
    onSuccess: (updatedDance, variables) => {
      queryClient.setQueryData(['dance', variables.id], updatedDance);
      queryClient.invalidateQueries({ queryKey: ['dances'] });
    },
  });
};

export const useCreateDance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDance: DanceInsert) => createDance(newDance),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dances'] })
  });
};

export const useDeleteDance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteDance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dances'] })
  });
};


// Helpers

const buildDancesColumn = (dance: Dance) => {
  const relations = dance.programs_dances ?? []
  const sorted = relations.sort((a, b) => {
    const dateA = a.program?.date || '';
    const dateB = b.program?.date || '';
    return dateA.localeCompare(dateB);
  }).reverse();
  return ({
    ...dance,
    programs_dances: sorted,
    programNames: dance.programs_dances.map(pd => pd.program.location).join(', ')
  });
};
