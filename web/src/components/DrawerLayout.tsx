import { Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDrawerActions } from '@/contexts/DrawerContext';
import type { ReactNode } from 'react';

export const DrawerLayout = ({ title, children, footer, onClose }: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose?: () => void;
}) => {
  const { closeDrawer } = useDrawerActions();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' noWrap sx={{ flex: 1 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose ?? closeDrawer} size='small'>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto', mr: -2, pr: 2, overscrollBehavior: 'contain' }}>
        {children}
      </Box>

      {/* Fixed footer */}
      <Box sx={{ pt: 2, mt: 8, borderTop: 2 }}>
        {footer}
      </Box>
    </Box>
  );
};
