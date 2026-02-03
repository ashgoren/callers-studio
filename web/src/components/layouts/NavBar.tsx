import { Link } from 'react-router'
import { Box, Typography, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTitle } from '@/contexts/TitleContext';
import { ColorModeToggle } from './ColorModeToggle';

export const NavBar = () => {
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
