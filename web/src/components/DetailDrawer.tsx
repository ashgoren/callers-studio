import { useEffect } from 'react';
import { Drawer, Box, ClickAwayListener } from '@mui/material';
import { useDrawerState } from '@/contexts/DrawerContext';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { DanceDetails } from './Dances/DanceDetails';
import { ProgramDetails } from './Programs/ProgramDetails';

const DETAIL_COMPONENTS: Record<string, React.ComponentType<{ id: number }>> = {
  dance: DanceDetails,
  program: ProgramDetails,
};

export const DetailDrawer = () => {
  const { closeDrawer } = useDrawerActions();
  const { isOpen, model, id, isEditing } = useDrawerState();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isEditing) closeDrawer();
    };    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isEditing, closeDrawer]);

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    if (isEditing) return; // Don't close if in editing mode
    const target = event.target as HTMLElement;
    if (target.closest('.MuiTable-root') || target.closest('.MuiTableContainer-root')) {
      return; // Don't close if clicking inside the table
    }
    closeDrawer();
  };

  if (!model || !id) return null;

  const DetailComponent = DETAIL_COMPONENTS[model];
  if (!DetailComponent) return null;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Drawer
        variant='persistent'
        anchor='right'
        open={isOpen}
        sx={{
          '& .MuiDrawer-paper': { width: 400, height: '100vh', overflowY: 'auto'}
        }}
      >
        <Box sx={{ p: 2 }}>
          <DetailComponent id={id} />
        </Box>
      </Drawer>
    </ClickAwayListener>
  );
};
