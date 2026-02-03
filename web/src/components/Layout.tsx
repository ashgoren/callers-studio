import { RecordDrawer } from '@/components/RecordDrawer';
import { Link } from 'react-router'
import { SnackbarProvider, closeSnackbar } from 'notistack'
import { CssBaseline, Box, Typography, IconButton } from '@mui/material';
import { createTheme, ThemeProvider, useColorScheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import HomeIcon from '@mui/icons-material/Home';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTitle } from '@/contexts/TitleContext';
import { useDrawerState } from '@/contexts/DrawerContext';
import type { ReactNode } from 'react';

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 800,
    lg: 1200,
    xl: 1536,
  },
};

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        action: {
          hover: grey[100],
          selected: grey[200],
        },
      },
    },
    dark: {
      palette: {
        action: {
          hover: grey[900],
          selected: grey[800],
        },
      },
    },
  },
  breakpoints,
});

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isOpen } = useDrawerState();

  const drawerWidth = 400;

  return (
    <ThemeProvider theme={theme} defaultMode='system'>
      <CssBaseline />
      <LayoutContent>
        <Box sx={{
            mr: isOpen ? `${drawerWidth}px` : 0,
            transition: theme => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            })
          }}>
          {children}
        </Box>
      </LayoutContent>
    </ThemeProvider>
  );
};

const LayoutContent = ({ children }: { children: ReactNode }) => {
  return (
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
      <Box sx={{ p: 2, pt: 1, margin: 0, width: '100vw', boxSizing: 'border-box' }}>
        <NavBar />
        <RecordDrawer />
        {children}
      </Box>
    </SnackbarProvider>
  )
}

const NavBar = () => {
  const { title } = useTitle();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <IconButton component={Link} to='/' color='inherit'>
          <HomeIcon />
        </IconButton>
      </Box>
      <Typography variant='h5' component='h1'>
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <ColorModeToggle />
      </Box>
    </Box>
  );
};

const ColorModeToggle = () => {
  const { mode, setMode } = useColorScheme();

  const toggleColorMode = () =>
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');

  return (
    <IconButton onClick={toggleColorMode} color='inherit'>
      {mode === 'dark' ? <Brightness4Icon /> : mode === 'light' ? <Brightness7Icon /> : <Brightness6Icon />}
    </IconButton>
  );
};
