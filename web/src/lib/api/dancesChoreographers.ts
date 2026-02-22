import { createJunctionApi } from './auxiliaryFactory';

const { add, remove } = createJunctionApi('dances_choreographers', 'choreographer_id');
export const addChoreographerToDance = add;
export const removeChoreographerFromDance = remove;
