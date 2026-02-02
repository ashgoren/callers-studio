import { Box } from '@mui/material';
import { useDrawerActions } from '@/contexts/DrawerContext';
import type { Model } from '@/lib/types/database';

export const RelationCell = <TRelation,>({ items, model, getId, getLabel }: {
  items: TRelation[] | null | undefined;
  model: Model;
  getId: (item: TRelation) => number;
  getLabel: (item: TRelation) => string;
}) => {
  const { openDrawer } = useDrawerActions();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
      {items?.map((item) => (
        <Box
          key={getId(item)}
          onClick={(e) => {
            e.stopPropagation();
            openDrawer(model, getId(item));
          }}
          sx={{ cursor: 'pointer', textDecoration: 'underline', color: 'secondary.main', '&:hover': { color: 'secondary.dark' } }}
        >
          {getLabel(item)}
        </Box>
      ))}
    </Box>
  );
};
