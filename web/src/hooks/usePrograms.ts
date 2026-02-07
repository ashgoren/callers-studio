import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProgram, getPrograms, updateProgram, createProgram, deleteProgram } from '@/lib/api/programs'
import type { Program, ProgramInsert, ProgramUpdate } from '@/lib/types/database';

export const usePrograms = () => {
  return useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms,
    select: (data: Program[]) => data.map(program => buildProgramsColumn(program)),
  })
};

export const useProgram = (id: number) => {
  return useQuery({
    queryKey: ['program', id],
    queryFn: () => getProgram(id),
    enabled: !!id,
    select: (data: Program) => buildProgramsColumn(data)
  })
};

export const useUpdateProgram = () => {
  const { success, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ProgramUpdate }) =>
      updateProgram(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Program updated');
    },
    onError: (err: Error) => error(err.message || 'Error updating program')
  });
};

export const useCreateProgram = () => {
  const { success, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProgram: ProgramInsert) => createProgram(newProgram),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Program created');
    },
    onError: (err: Error) => error(err.message || 'Error creating program')
  });
};

export const useDeleteProgram = () => {
  const { info, error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      info('Program deleted');
    },
    onError: (err: Error) => error(err.message || 'Error deleting program')
  });
};


// Helpers

const buildProgramsColumn = (program: Program) => ({
  ...program,
  danceNames: program.programs_dances.map(pd => pd.dance.title).join(', ')
});
