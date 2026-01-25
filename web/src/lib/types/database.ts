// Relies on generated types from database_generated.ts
// Regenerate with: supabase gen types typescript --local > database_generated.ts

import type { Database } from './database_generated';

type Tables = Database['public']['Tables'];

export type Dance = Tables['dances']['Row'];
export type DanceInsert = Tables['dances']['Insert'];
export type DanceUpdate = Tables['dances']['Update'];

export type Program = Tables['programs']['Row'];
export type ProgramInsert = Tables['programs']['Insert'];
export type ProgramUpdate = Tables['programs']['Update'];

export type DanceProgram = Tables['dancesPrograms']['Row'];
export type DanceProgramInsert = Tables['dancesPrograms']['Insert'];
export type DanceProgramUpdate = Tables['dancesPrograms']['Update'];
