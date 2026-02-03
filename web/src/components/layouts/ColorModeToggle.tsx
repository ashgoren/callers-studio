import { IconButton } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export const ColorModeToggle = () => {
  const { mode, setMode } = useColorScheme();

  const toggleColorMode = () =>
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');

  return (
    <IconButton onClick={toggleColorMode} color='inherit'>
      {mode === 'dark' ? <Brightness4Icon /> : mode === 'light' ? <Brightness7Icon /> : <Brightness6Icon />}
    </IconButton>
  );
};
