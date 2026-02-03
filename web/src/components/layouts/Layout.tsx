import { SnackbarProvider, closeSnackbar } from 'notistack'
import { CssBaseline, Box, IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { theme } from './themeConfig';
import { NavBar } from './NavBar';
import { RecordDrawer } from '@/components/RecordDrawer';
import { useDrawerState } from '@/contexts/DrawerContext';
import type { ReactNode } from 'react';

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isOpen } = useDrawerState();

  const drawerWidth = 400;

  return (
    <ThemeProvider theme={theme} defaultMode='system'>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={4000}
        iconVariant={{ error: <ErrorOutlineIcon sx={{mr: 1}} />  }}
        action={(snackbarId) => (
          <IconButton size='small' color='inherit' onClick={() => closeSnackbar(snackbarId)}>
            <CloseIcon fontSize='small' />
          </IconButton>
        )}
      >
        <Box sx={{
          mr: isOpen ? `${drawerWidth}px` : 0,
          transition: theme => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          })
        }}>
          <Box sx={{ p: 2, pt: 1, margin: 0, width: '100vw', boxSizing: 'border-box' }}>
            <NavBar />
            <RecordDrawer />
            {children}
          </Box>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
};
