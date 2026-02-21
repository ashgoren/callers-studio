// Relies on generated types from database_generated.ts
// Regenerate with: supabase gen types typescript --local > database_generated.ts

import type { Database } from './database_generated';

type Tables = Database['public']['Tables'];

export type Model = 'dance' | 'program' | 'choreographer';

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
