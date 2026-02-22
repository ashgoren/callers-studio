import { createJunctionApi } from './auxiliaryFactory';

const { add, remove } = createJunctionApi('dances_key_moves', 'key_move_id');
export const addKeyMoveToDance = add;
export const removeKeyMoveFromDance = remove;
