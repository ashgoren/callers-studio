import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';
import { Link as RouterLink } from 'react-router'
import { Typography, Link, List, ListItem } from '@mui/material'

export const Home = () => {
  const { setTitle } = useTitle();
  useEffect(() => setTitle("Caller's Box"), [setTitle]);

  return (
    <>
      <Typography variant='h4' gutterBottom>
        Choose a table
      </Typography>
      <List>
        <ListItem>
          <Link component={RouterLink} to="/dances">Dances</Link>
        </ListItem>
        <ListItem>
          <Link component={RouterLink} to="/programs">Programs</Link>
        </ListItem>
      </List>
    </>
  );
};
