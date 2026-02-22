import { createAuxiliaryApi } from './auxiliaryFactory';
import type { Choreographer, ChoreographerInsert, ChoreographerUpdate } from '@/lib/types/database';

export const {
  getAll: getChoreographers,
  create: createChoreographer,
  update: updateChoreographer,
  delete: deleteChoreographer,
} = createAuxiliaryApi<Choreographer, ChoreographerInsert, ChoreographerUpdate>(
  'choreographers', 'dances_choreographers(id)'
);
