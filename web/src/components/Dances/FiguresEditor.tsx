import { Box, TextField, IconButton, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {figures.map((figure, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size='small' sx={{ width: 90 }}>
              <InputLabel>Phrase</InputLabel>
              <Select
                label='Phrase'
                value={figure.phrase || 'A1'}
                onChange={(e) => onUpdate(index, 'phrase', e.target.value)}
              >
                {PHRASE_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size='small'
              label='Beats'
              type='number'
              value={figure.beats ?? ''}
              onChange={(e) => onUpdate(index, 'beats', e.target.value === '' ? null : Number(e.target.value))}
              sx={{ width: 70 }}
            />
            <Box sx={{ flex: 1 }} />
            <IconButton size='small' onClick={() => onDelete(index)} color='error'>
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Box>
          <TextField
            size='small'
            label=''
            value={figure.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            fullWidth
            multiline
            minRows={1}
            maxRows={5}
          />
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={onAdd}
        size='small'
        variant='text'
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Figure
      </Button>
    </Box>
  );
};
