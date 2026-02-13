import { Link } from 'react-router'
import { useEffect } from 'react';
import { Typography, IconButton, AppBar, Toolbar, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useTitle } from '@/contexts/TitleContext';
import { useUndoState, useUndoActions } from '@/contexts/UndoContext';
import { ColorModeToggle } from './ColorModeToggle';

// TO DO: Add drawer for mobile nav (https://mui.com/material-ui/react-app-bar/#responsive-app-bar-with-drawer)
export const NavBar = () => {
  const { title } = useTitle();
  const { canUndo, canRedo, undoLabel, redoLabel } = useUndoState();
  const { undo, redo } = useUndoActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return (
    <>
      <AppBar
        position='fixed'
        color='default'
        elevation={1}
        // sx={{ left: 0, width: isRecordDrawerOpen ? `calc(100vw - ${DRAWER_WIDTH}px)` : '100vw' }}
      >
        <Toolbar>
          <IconButton component={Link} to='/' color='inherit' edge='start'>
            <HomeIcon />
          </IconButton>
          <Typography variant='h6' component='h1' sx={{ flexGrow: 1, textAlign: 'center' }}>
            {title}
          </Typography>
          <Tooltip title={undoLabel ? `Undo: ${undoLabel}` : 'Nothing to undo'}>
            <span>
              <IconButton color='inherit' onClick={undo} disabled={!canUndo}>
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={redoLabel ? `Redo: ${redoLabel}` : 'Nothing to redo'}>
            <span>
              <IconButton color='inherit' onClick={redo} disabled={!canRedo}>
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <ColorModeToggle />
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer to offset fixed AppBar */}
    </>
  );
}
