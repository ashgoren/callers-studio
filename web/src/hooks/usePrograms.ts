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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ProgramUpdate }) =>
      updateProgram(id, updates),
    onSuccess: (updatedProgram, variables) => {
      queryClient.setQueryData(['program', variables.id], updatedProgram);
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProgram: ProgramInsert) => createProgram(newProgram),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] })
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteProgram(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] })
  });
};


// Helpers

const buildProgramsColumn = (program: Program) => ({
  ...program,
  danceNames: program.programs_dances.map(pd => pd.dance.title).join(', ')
});
