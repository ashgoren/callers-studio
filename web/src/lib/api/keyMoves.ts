import { createAuxiliaryApi } from './auxiliaryFactory';
import type { KeyMove, KeyMoveInsert, KeyMoveUpdate } from '@/lib/types/database';

export const {
  getAll: getKeyMoves,
  create: createKeyMove,
  update: updateKeyMove,
  delete: deleteKeyMove,
} = createAuxiliaryApi<KeyMove, KeyMoveInsert, KeyMoveUpdate>(
  'key_moves', 'dances_key_moves(id)'
);
