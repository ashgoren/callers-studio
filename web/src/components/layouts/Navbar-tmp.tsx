import { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, ListItem, Box, IconButton, Menu, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import type { MouseEvent } from 'react';

export const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<HTMLElement | null>(null);

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const contentMultiline = (
    <>
      {/* hamburger menu for xs and sm screens */}
      <Box sx={{ flexGrow: 1, display: { xs: 'flex', sm: 'none' } }}>
        <IconButton size='large' onClick={handleOpenNavMenu} color='inherit' aria-label='navigation menu' aria-controls='menu-appbar' aria-haspopup='true'>
          <MenuIcon />
        </IconButton>
        <Menu
          id='menu-appbar'
          anchorEl={anchorElNav}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          test
        </Menu>
        {/* <ListItem sx={{ my: 2, color: 'inherit', display: 'block' }}>
          <Typography textAlign='center'>ECD Ball 2023</Typography>
        </ListItem> */}
      </Box>

      {/* brand icon */}
      <Box sx={{ display: { xs: 'none', md: 'inline' } }}>
        {/* <Link component={RouterLink} to='/'>
          <img src={'/logo.png'} alt=' style={{ margin: '10px 10px 10px 0px' }}/>
        </Link> */}
      </Box>

      <Box sx={{ display: { xs: 'inline', sm: 'inline', md: 'none' } }}>
        {/* <Link component={RouterLink} to='/'>
          <img src={'/logo.png'} alt=' style={{ margin: '10px 10px 10px 0px', height: '80px' }}/>
        </Link> */}
      </Box>

      <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' } }}>
        {/* <PageLinks pages={pages} onClick={handleCloseNavMenu} /> */}
        test title
      </Box>
    </>
  );

  return (
    <AppBar position='relative'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>

          {/* color mode toggle always goes to the right */}
          {/* <ColorModeToggle toggleColorMode={toggleColorMode} /> */}

        </Toolbar>
      </Container>
    </AppBar>
  );
};
