import { supabase } from '@/lib/supabase'
import type { KeyMove, KeyMoveRow, KeyMoveInsert, KeyMoveUpdate } from '@/lib/types/database';

export const getKeyMoves = async () => {
  const { data, error } = await supabase
    .from('key_moves')
    .select('*, dances_key_moves(id)')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching key moves:', error);
    throw new Error(error.message);
  }
  return data as KeyMove[];
};

export const updateKeyMove = async (id: number, updates: KeyMoveUpdate) => {
  const { data, error } = await supabase
    .from('key_moves')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as KeyMoveRow;
};

export const createKeyMove = async (newKeyMove: KeyMoveInsert) => {
  const { data, error } = await supabase
    .from('key_moves')
    .insert(newKeyMove)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as KeyMoveRow;
};

export const deleteKeyMove = async (id: number) => {
  const { error } = await supabase
    .from('key_moves')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
