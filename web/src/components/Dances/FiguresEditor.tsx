import { Box, TextField, IconButton, Button, Select, MenuItem, FormControl } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import type { FigureItem } from '@/lib/types/database';

const PHRASE_OPTIONS = ['A1', 'A2', 'B1', 'B2'];

type Props = {
  figures: FigureItem[];
  onAdd: () => void;
  onUpdate: (index: number, key: 'phrase' | 'beats' | 'description', value: string | number | null) => void;
  onDelete: (index: number) => void;
};

export const FiguresEditor = ({ figures, onAdd, onUpdate, onDelete }: Props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {figures.map((figure, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size='small' sx={{ width: 90 }}>
              <Select
                value={figure.phrase || 'A1'}
                onChange={(e) => onUpdate(index, 'phrase', e.target.value)}
                sx={{ '& fieldset': { border: 'none' } }}
              >
                {PHRASE_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size='small'
              type='number'
              value={figure.beats ?? ''}
              onChange={(e) => onUpdate(index, 'beats', e.target.value === '' ? null : Number(e.target.value))}
              variant='standard'
              sx={{ width: 50 }}
            />
            <TextField
              size='small'
              value={figure.description}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              fullWidth
              variant='standard'
              sx={{ ml: 1 }}
            />
            <Box sx={{ flex: 1 }} />
            <IconButton size='small' onClick={() => onDelete(index)}>
              <RemoveCircleOutlineIcon fontSize='small' />
            </IconButton>
          </Box>
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={onAdd}
        size='small'
        variant='text'
        color='secondary'
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Figure
      </Button>
    </Box>
  );
};
