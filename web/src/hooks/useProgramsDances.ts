import { useNotify } from '@/hooks/useNotify';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addDanceToProgram, removeDanceFromProgram } from '@/lib/api/programsDances';

export const useAddDanceToProgram = () => {
  const { error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, danceId, order }: { programId: number; danceId: number; order: number }) =>
      addDanceToProgram(programId, danceId, order),
    onSuccess: (_, { programId, danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['dances', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      // success('Dance added to program');
    },
    onError: (err: Error) => error(err.message || 'Error adding dance to program')
  });
};

export const useRemoveDanceFromProgram = () => {
  const { error } = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, danceId }: { programId: number; danceId: number }) =>
      removeDanceFromProgram(programId, danceId),
    onSuccess: (_, { programId, danceId }) => {
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['dances', danceId] });
      queryClient.invalidateQueries({ queryKey: ['dances'] });
      // info('Dance removed from program');
    },
    onError: (err: Error) => error(err.message || 'Error removing dance from program')
  });
};

// export const useUpdateDanceOrderInProgram = () => {
//   const { success, error } = useNotify();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ programId, danceId, order }: { programId: number; danceId: number; order: number }) =>
//       updateDanceOrderInProgram(programId, danceId, order),
//     onSuccess: (_, { programId }) => {
//       queryClient.invalidateQueries({ queryKey: ['program', programId] });
//       queryClient.invalidateQueries({ queryKey: ['programs'] });
//       success('Dance order updated');
//     },
//     onError: (err: Error) => error(err.message || 'Error updating dance order')
//   });
// };

// export const useReorderDancesInProgram = () => {
//   const { error } = useNotify();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ programId, orderedDanceIds }: { programId: number; orderedDanceIds: number[] }) =>
//       reorderDancesInProgram(programId, orderedDanceIds),
//     onSuccess: (_, { programId }) => {
//       queryClient.invalidateQueries({ queryKey: ['program', programId] });
//       queryClient.invalidateQueries({ queryKey: ['programs'] });
//     },
//     onError: (err: Error) => error(err.message || 'Failed to reorder dances'),
//   });
// };
