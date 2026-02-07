import { supabase } from '@/lib/supabase'

export const addChoreographerToDance = async (danceId: number, choreographerId: number) => {
  const { error } = await supabase
    .from('dances_choreographers')
    .insert({ dance_id: danceId, choreographer_id: choreographerId })

  if (error) throw new Error(error.message);
};

export const removeChoreographerFromDance = async (danceId: number, choreographerId: number) => {
  const { error } = await supabase
    .from('dances_choreographers')
    .delete()
    .eq('dance_id', danceId)
    .eq('choreographer_id', choreographerId)

  if (error) throw new Error(error.message);
};
