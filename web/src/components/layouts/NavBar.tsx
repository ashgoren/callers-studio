import { Link } from 'react-router'
import { Typography, IconButton, AppBar, Toolbar } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTitle } from '@/contexts/TitleContext';
import { ColorModeToggle } from './ColorModeToggle';

// TO DO: Add drawer for mobile nav (https://mui.com/material-ui/react-app-bar/#responsive-app-bar-with-drawer)
export const NavBar = () => {
  const { title } = useTitle();
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
          <ColorModeToggle />
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer to offset fixed AppBar */}
    </>
  );
}
