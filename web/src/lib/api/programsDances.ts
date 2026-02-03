import { supabase } from '@/lib/supabase'

export const addDanceToProgram = async (programId: number, danceId: number, order: number) => {
  const { error } = await supabase
    .from('programs_dances')
    .insert({ program_id: programId, dance_id: danceId, order })

  if (error) throw new Error(error.message);
};

export const removeDanceFromProgram = async (programId: number, danceId: number) => {
  const { error } = await supabase
    .from('programs_dances')
    .delete()
    .eq('program_id', programId)
    .eq('dance_id', danceId)

  if (error) throw new Error(error.message);
};

// export const updateDanceOrderInProgram = async (programId: number, danceId: number, order: number) => {
//   const { error } = await supabase
//     .from('programs_dances')
//     .update({ order })
//     .eq('program_id', programId)
//     .eq('dance_id', danceId)

//   if (error) throw new Error(error.message);
// };

// export const reorderDancesInProgram = async (programId: number, orderedDanceIds: number[]) => {
//   // Update each dance's order based on array position
//   const updates = orderedDanceIds.map((danceId, index) =>
//     supabase
//       .from('programs_dances')
//       .update({ order: index + 1 })
//       .eq('program_id', programId)
//       .eq('dance_id', danceId)
//   );

//   const results = await Promise.all(updates);
//   const error = results.find(r => r.error)?.error;

//   if (error) throw new Error(error.message);
// };
