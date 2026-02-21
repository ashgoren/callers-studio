// Relies on generated types from database_generated.ts
// Regenerate with: supabase gen types typescript --local > database_generated.ts

import type { Database } from './database_generated';

type Tables = Database['public']['Tables'];

export type Model = 'dance' | 'program' | 'choreographer' | 'key_move' | 'vibe';

export type DanceRow = Tables['dances']['Row'];
export type Dance = DanceRow & {
  programs_dances: { id: number; order: number; program: ProgramRow }[],
  dances_choreographers: { id: number; choreographer: ChoreographerRow }[]
};
export type DanceInsert = Tables['dances']['Insert'];
export type DanceUpdate = Tables['dances']['Update'];

export type ProgramRow = Tables['programs']['Row'];
export type Program = ProgramRow & { programs_dances: { id: number; order: number; dance: DanceRow }[] };
export type ProgramInsert = Tables['programs']['Insert'];
export type ProgramUpdate = Tables['programs']['Update'];

export type ChoreographerRow = Tables['choreographers']['Row'];
export type Choreographer = ChoreographerRow & { dances_choreographers: { id: number }[] };
export type ChoreographerInsert = Tables['choreographers']['Insert'];
export type ChoreographerUpdate = Tables['choreographers']['Update'];

export type KeyMoveRow = Tables['key_moves']['Row'];
export type KeyMove = KeyMoveRow & { dances_key_moves: { id: number }[] };
export type KeyMoveInsert = Tables['key_moves']['Insert'];
export type KeyMoveUpdate = Tables['key_moves']['Update'];

export type VibeRow = Tables['vibes']['Row'];
export type Vibe = VibeRow & { dances_vibes: { id: number }[] };
export type VibeInsert = Tables['vibes']['Insert'];
export type VibeUpdate = Tables['vibes']['Update'];
