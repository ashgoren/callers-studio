import { createJunctionApi } from './auxiliaryFactory';

const { add, remove } = createJunctionApi('dances_vibes', 'vibe_id');
export const addVibeToDance = add;
export const removeVibeFromDance = remove;
