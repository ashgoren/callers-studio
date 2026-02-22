import { supabase } from '@/lib/supabase';

export const createAuxiliaryApi = <TRow extends { id: number }, TInsert, TUpdate>(
  tableName: string,
  junctionSelect: string,
) => {
  const table = () => supabase.from(tableName as any);

  return {
    getAll: async (): Promise<TRow[]> => {
      const { data, error } = await table()
        .select(`*, ${junctionSelect}`)
        .order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as unknown as TRow[];
    },
    create: async (item: TInsert): Promise<TRow> => {
      const { data, error } = await table()
        .insert(item)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return data as TRow;
    },
    update: async (id: number, updates: TUpdate): Promise<TRow> => {
      const { data, error } = await table()
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return data as TRow;
    },
    delete: async (id: number): Promise<void> => {
      const { error } = await table()
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
};

export const createJunctionApi = (junctionTable: string, relatedIdColumn: string) => {
  const table = () => supabase.from(junctionTable as any);

  return {
    add: async (danceId: number, relatedId: number) => {
      const { data, error } = await table()
        .insert({ dance_id: danceId, [relatedIdColumn]: relatedId })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    remove: async (danceId: number, relatedId: number) => {
      const { data, error } = await table()
        .delete()
        .eq('dance_id', danceId)
        .eq(relatedIdColumn, relatedId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  };
};
