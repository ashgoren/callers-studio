import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTitle } from '@/contexts/TitleContext';
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const SETTINGS_ITEMS = [
  {
    label: 'Choreographers',
    description: 'Manage choreographer names',
    path: '/settings/choreographers',
    icon: <PeopleIcon />,
  },
];

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  useEffect(() => setTitle('Settings'), [setTitle]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, px: 2 }}>
      <List disablePadding>
        {SETTINGS_ITEMS.map(item => (
          <ListItemButton key={item.path} onClick={() => navigate(item.path)} divider>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} secondary={item.description} />
            <ChevronRightIcon color='action' />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};
