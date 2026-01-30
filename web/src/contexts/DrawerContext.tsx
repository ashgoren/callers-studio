/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

type DrawerState = {
  isOpen: boolean;
  model: string | null;
  id: number | null;
  isEditing: boolean;
};

type DrawerActions = {
  openDrawer: (model: string, id: number) => void;
  closeDrawer: () => void;
  setIsEditing: (isEditing: boolean) => void;
};

const DrawerStateContext = createContext<DrawerState | null>(null);
const DrawerActionsContext = createContext<DrawerActions | null>(null);

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DrawerState>({ 
    isOpen: false, model: null, id: null, isEditing: false
  });

  const actions = useMemo(() => ({
    openDrawer: (model: string, id: number) => {
      setState(prev => {
        if (prev.isEditing) return prev; // Prevent opening if in editing mode
        return ({ isOpen: true, model, id, isEditing: false });
      });
    },
    closeDrawer: () => {
      setState(prev => ({ ...prev, isOpen: false, isEditing: false }));
    },
    setIsEditing: (isEditing: boolean) => {
      setState(prev => ({ ...prev, isEditing }));
    }
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
