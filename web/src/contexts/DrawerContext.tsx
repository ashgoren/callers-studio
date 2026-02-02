/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Model } from '@/lib/types/database';

type DrawerMode = 'view' | 'edit' | 'create';

type DrawerState = {
  isOpen: boolean;
  model: Model | null;
  id: number | null;
  mode: DrawerMode;
};

type DrawerActions = {
  openDrawer: (model: Model, id: number) => void;
  closeDrawer: () => void;
  setMode: (mode: DrawerMode) => void;
  openDrawerForNewRecord: (model: Model) => void;
};

const DrawerStateContext = createContext<DrawerState | null>(null);
const DrawerActionsContext = createContext<DrawerActions | null>(null);

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DrawerState>({ 
    isOpen: false, model: null, id: null, mode: 'view'
  });

  const actions = useMemo(() => ({
    openDrawer: (model: Model, id: number) => {
      setState(prev => {
        if (prev.mode !== 'view') return prev; // Prevent action if in edit/create mode
        return ({ isOpen: true, model, id, mode: 'view' });
      });
    },
    openDrawerForNewRecord: (model: Model) => {
      setState(prev => {
        if (prev.mode !== 'view') return prev; // Prevent action if in edit/create mode
        return ({ isOpen: true, model, id: null, mode: 'create' });
      });
    },
    closeDrawer: () => {
      setState({ isOpen: false, model: null, id: null, mode: 'view' });
    },
    setMode: (mode: DrawerMode) => {
      setState(prev => ({ ...prev, mode }));
    },
  }), []);

  return (
    <DrawerActionsContext.Provider value={actions}>
      <DrawerStateContext.Provider value={state}>
        {children}
      </DrawerStateContext.Provider>
    </DrawerActionsContext.Provider>
  );
};

export const useDrawerState = () => {
  const context = useContext(DrawerStateContext);
  if (!context) throw new Error('useDrawerState must be used within DrawerProvider');
  return context;
};

export const useDrawerActions = () => {
  const context = useContext(DrawerActionsContext);
  if (!context) throw new Error('useDrawerActions must be used within DrawerProvider');
  return context;
};
