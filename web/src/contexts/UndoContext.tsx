/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, useState, useMemo, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/react-query';

type UndoOp =
  | { type: 'insert'; table: string; record: Record<string, unknown> }
  | { type: 'update'; table: string; id: number; before: Record<string, unknown>; after: Record<string, unknown> }
  | { type: 'delete'; table: string; id: number; record: Record<string, unknown> };

export type UndoAction = {
  label: string;
  ops: UndoOp[];
};

type UndoState = {
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
};

type UndoActions = {
  pushAction: (action: UndoAction) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
};

const UndoStateContext = createContext<UndoState | null>(null);
const UndoActionsContext = createContext<UndoActions | null>(null);

function invertOps(ops: UndoOp[]): UndoOp[] {
  return ops.map(op => {
    switch (op.type) {
      case 'insert':
        return { type: 'delete', table: op.table, id: (op.record as { id: number }).id, record: op.record };
      case 'delete':
        return { type: 'insert', table: op.table, record: op.record };
      case 'update':
        return { type: 'update', table: op.table, id: op.id, before: op.after, after: op.before };
    }
  });
}

function isDependent(op: UndoOp): boolean {
  const record = op.type === 'update' ? op.after : op.record;
  return Object.keys(record).some(k => k.endsWith('_id'));
}

function sortOps(ops: UndoOp[]): UndoOp[] {
  return [...ops].sort((a, b) => {
    if (a.type === 'insert' && b.type === 'insert') {
      return Number(isDependent(a)) - Number(isDependent(b));
    }
    if (a.type === 'delete' && b.type === 'delete') {
      return Number(isDependent(b)) - Number(isDependent(a));
    }
    return 0;
  });
}

async function executeOps(ops: UndoOp[]) {
  const sorted = sortOps(ops);
  const tablesToInvalidate = new Set<string>();

  for (const op of sorted) {
    tablesToInvalidate.add(op.table);

    switch (op.type) {
      case 'insert': {
        const { error } = await supabase.from(op.table).insert(op.record);
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await supabase.from(op.table).delete().eq('id', op.id);
        if (error) throw error;
        break;
      }
      case 'update': {
        const { error } = await supabase.from(op.table).update(op.after).eq('id', op.id);
        if (error) throw error;
        break;
      }
    }
  }

  for (const table of tablesToInvalidate) {
    queryClient.invalidateQueries({ queryKey: [table] });
  }
}

export const UndoProvider = ({ children }: { children: ReactNode }) => {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const state: UndoState = useMemo(() => ({
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoLabel: undoStack.at(-1)?.label ?? null,
    redoLabel: redoStack.at(-1)?.label ?? null,
  }), [undoStack, redoStack]);

  const pushAction = useCallback((action: UndoAction) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(async () => {
    const action = undoStack.at(-1);
    if (!action) return;

    try {
      const undoOps = invertOps(action.ops);
      await executeOps(undoOps);
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, { label: action.label, ops: undoOps }]);
    } catch (e) {
      console.error('Undo failed:', e);
    }
  }, [undoStack]);

  const redo = useCallback(async () => {
    const action = redoStack.at(-1);
    if (!action) return;

    try {
      const redoOps = invertOps(action.ops);
      await executeOps(redoOps);
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, { label: action.label, ops: redoOps }]);
    } catch (e) {
      console.error('Redo failed:', e);
    }
  }, [redoStack]);

  const actions = useMemo(() => ({ pushAction, undo, redo }), [pushAction, undo, redo]);

  return (
    <UndoActionsContext.Provider value={actions}>
      <UndoStateContext.Provider value={state}>
        {children}
      </UndoStateContext.Provider>
    </UndoActionsContext.Provider>
  );
};

export const useUndoState = () => {
  const context = useContext(UndoStateContext);
  if (!context) throw new Error('useUndoState must be used within UndoProvider');
  return context;
};

export const useUndoActions = () => {
  const context = useContext(UndoActionsContext);
  if (!context) throw new Error('useUndoActions must be used within UndoProvider');
  return context;
};
