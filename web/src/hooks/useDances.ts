import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDances, getDance, updateDance, createDance, deleteDance } from '@/lib/api/dances'
import type { Dance, DanceUpdate, DanceInsert } from '@/lib/types/database';

export const useDances = () => {
  return useQuery({
    queryKey: ['dances'],
    queryFn: getDances,
    select: ((data: Dance[]) => data.map(buildRelationsColumns))
  });
};

export const useDance = (id: number) => {
  return useQuery({
    queryKey: ['dance', id],
    queryFn: () => getDance(id),
    enabled: !!id,
    select: (data: Dance) => buildRelationsColumns(data)
  })
};

export const useUpdateDance = () => {
  const { success, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: DanceUpdate }) =>
      updateDance(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dance', variables.id] });
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

const buildRelationsColumns = (dance: Dance) => {
  const sortedPrograms = (dance.programs_dances ?? []).sort((a, b) => {
    const dateA = a.program?.date || '';
    const dateB = b.program?.date || '';
    return dateA.localeCompare(dateB);
  }).reverse();

  const sortedChoreographers = (dance.dances_choreographers ?? []).sort((a, b) => {
    const nameA = a.choreographer?.name || '';
    const nameB = b.choreographer?.name || '';
    return nameA.localeCompare(nameB);
  });

  return {
    ...dance,
    programs_dances: sortedPrograms,
    programNames: sortedPrograms.map(pd => pd.program.location).join(', '),
    dances_choreographers: sortedChoreographers,
    choreographerNames: sortedChoreographers.map(dc => dc.choreographer.name).join(', ')
  };
};
