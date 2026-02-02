// Relies on generated types from database_generated.ts
// Regenerate with: supabase gen types typescript --local > database_generated.ts

import type { Database } from './database_generated';

type Tables = Database['public']['Tables'];

export type Model = 'dance' | 'program';

export type DanceRow = Tables['dances']['Row'];
export type Dance = DanceRow & {
  programs_dances: { program: ProgramRow }[];
}
export type DanceInsert = Tables['dances']['Insert'];
export type DanceUpdate = Tables['dances']['Update'];

export type ProgramRow = Tables['programs']['Row'];
export type Program = ProgramRow & {
  programs_dances: { order: number; dance: DanceRow }[];
};
export type ProgramInsert = Tables['programs']['Insert'];
export type ProgramUpdate = Tables['programs']['Update'];

export type DanceProgram = Tables['programs_dances']['Row'];
export type DanceProgramInsert = Tables['programs_dances']['Insert'];
export type DanceProgramUpdate = Tables['programs_dances']['Update'];
