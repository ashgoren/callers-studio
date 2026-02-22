import { createAuxiliaryApi } from './auxiliaryFactory';
import type { Vibe, VibeInsert, VibeUpdate } from '@/lib/types/database';

export const {
  getAll: getVibes,
  create: createVibe,
  update: updateVibe,
  delete: deleteVibe,
} = createAuxiliaryApi<Vibe, VibeInsert, VibeUpdate>(
  'vibes', 'dances_vibes(id)'
);
