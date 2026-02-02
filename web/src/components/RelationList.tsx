import { useDrawerActions } from '@/contexts/DrawerContext';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import type { Model } from '@/lib/types/database';

type RelationListProps<TRelation> = {
  model: Model;
  label: string;
  relations: TRelation[];
  getRelationId: (relation: TRelation) => number;
  getRelationLabel: (relation: TRelation) => string;
};

export const RelationList = <TRelation,>({ model, label, relations, getRelationId, getRelationLabel }: RelationListProps<TRelation>) => {
  const { openDrawer } = useDrawerActions();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <List dense>
        {relations.map((relation) => (
          <ListItem key={getRelationId(relation)} sx={{ p: 0 }}>
            <ListItemText
              primary={getRelationLabel(relation)}
              onClick={() => openDrawer(model, getRelationId(relation))}
              sx={{ cursor: 'pointer', textDecoration: 'underline', color: 'secondary.main', '&:hover': { color: 'secondary.dark' } }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
