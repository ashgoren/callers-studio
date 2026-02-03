import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 800,
    lg: 1200,
    xl: 1536,
  },
};

export const theme = createTheme({
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
