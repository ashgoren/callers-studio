import { useEffect } from 'react';
import { Drawer, Box, ClickAwayListener, useTheme, useMediaQuery } from '@mui/material';
import { useDrawerState } from '@/contexts/DrawerContext';
import { useDrawerActions } from '@/contexts/DrawerContext';
import { Dance } from './Dances/Dance';
import { Program } from './Programs/Program';

const DRAWER_WIDTH = 400;

const DETAIL_COMPONENTS: Record<string, React.ComponentType<{ id?: number }>> = {
  dance: Dance,
  program: Program
};

export const RecordDrawer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { closeDrawer } = useDrawerActions();
  const { isOpen, model, id, mode } = useDrawerState();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && mode === 'view') closeDrawer();
    };    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, mode, closeDrawer]);

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    if (mode !== 'view') return; // Don't close if in edit/create mode
    const target = event.target as HTMLElement;
    if (target.closest('.MuiTable-root') || target.closest('.MuiTableContainer-root')) {
      return; // Don't close if clicking inside the table
    }
    closeDrawer();
  };

  if (!model) return null;

  const DetailComponent = DETAIL_COMPONENTS[model];
  if (!DetailComponent) return null;

  const drawer = (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor='right'
      open={isOpen}
      onClose={isMobile && mode === 'view' ? closeDrawer : undefined}
      sx={{ '& .MuiDrawer-paper': {
        width: { xs: '100%', sm: DRAWER_WIDTH },
        height: '100dvh'
      }}}
    >
      <Box sx={{ p: 2, height: '100%' }}>
        <DetailComponent
          key={`${id}-${mode}`} // Force remount when id or mode changes to reset pending adds/removes
          id={id ?? undefined}
        />
      </Box>
    </Drawer>
  );

  if (isMobile) return drawer;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      {drawer}
    </ClickAwayListener>
  );
};
