import { createTheme, ThemeProvider, useColorScheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTitle } from '@/contexts/TitleContext';
import { grey } from '@mui/material/colors';
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

export const Layout = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={theme} defaultMode='system'>
    <CssBaseline />
    <LayoutContent>
      {children}
    </LayoutContent>
  </ThemeProvider>
);

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const { title } = useTitle();
  const { mode, setMode } = useColorScheme();

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
  };

  return (
    <Box sx={{ padding: 2, margin: 0, width: '100vw', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }} /> {/* spacer */}
          <Typography variant='h5' component='h1'>
            {title}
          </Typography>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <ColorModeToggle toggleColorMode={toggleColorMode} />
        </Box>
      </Box>
      {children}
    </Box>
  )
}

const ColorModeToggle = ({ toggleColorMode }: { toggleColorMode: () => void }) => {
  const { mode } = useColorScheme();

  return (
    <IconButton onClick={toggleColorMode} color='inherit'>
      {mode === 'dark' ? <Brightness4Icon /> : mode === 'light' ? <Brightness7Icon /> : <Brightness6Icon />}
    </IconButton>
  );
}
