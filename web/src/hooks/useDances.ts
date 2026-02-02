import { useNotify } from '@/hooks/useNotify';
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
  const { success, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: DanceUpdate }) =>
      updateDance(id, updates),
    onSuccess: (updatedDance, variables) => {
      queryClient.setQueryData(['dance', variables.id], updatedDance);
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      success('Dance updated');
    },
    onError: (err: Error) => error(err.message || 'Error updating dance')
  });
};

export const useCreateDance = () => {
  const { success, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDance: DanceInsert) => createDance(newDance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      success('Dance created');
    },
    onError: (err: Error) => error(err.message || 'Error creating dance')
  });
};

export const useDeleteDance = () => {
  const { info, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteDance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      info('Dance deleted');
    },
    onError: (err: Error) => error(err.message || 'Error deleting dance')
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
