import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Autocomplete, TextField } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import type { Program, Dance } from '@/lib/types/database';

type ProgramDanceEditorProps = {
  programDances: Program['programs_dances'];
  dances: Dance[];
  pending: {
    pendingAdds: { danceId: number; order: number }[]
    pendingRemoves: number[];
    addItem: (item: { danceId: number; order: number }) => void;
    removeItem: (danceId: number) => void;
  };
};

export const ProgramDancesEditor = ({ programDances, dances, pending }: ProgramDanceEditorProps) => {
  const [selectedDance, setSelectedDance] = useState<Dance | null>(null);
  const [order, setOrder] = useState<number | ''>('');

  const displayedRelations = computeDisplayedRelations({ programDances, dances, pending });
  const availableOptions = computeAvailableOptions({ programDances, dances, pending });

  const handleAdd = () => {
    if (!selectedDance || order === '') return;
    pending.addItem({ danceId: selectedDance.id, order: Number(order) });
    setSelectedDance(null);
    setOrder('');
  };

  const handleDanceSelect = (dance: Dance | null) => {
    setSelectedDance(dance);
    if (dance && order !== '') {
      pending.addItem({ danceId: dance.id, order: Number(order) });
      setSelectedDance(null);
      setOrder('');
    }
  };

  const handleOrderChange = () => {
    if (selectedDance && order !== '') {
      pending.addItem({ danceId: selectedDance.id, order: Number(order) });
      setSelectedDance(null);
      setOrder('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}>
      <Typography variant='caption' color='text.secondary'>
        Dances
      </Typography>
      <List dense>
        {displayedRelations.map(pd => (
          <ListItem
            key={pd.danceId}
            sx={{
              p: 0,
              opacity: pd.isPending ? 0.6 : 1,
              '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
            }}
            secondaryAction={
              <IconButton edge='end' size='small' onClick={() => pending.removeItem(pd.danceId)}>
                <RemoveCircleOutlineIcon fontSize='small' />
              </IconButton>
            }
          >
            <ListItemText primary={`${pd.order} - ${pd.title}`} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
        <TextField
          size='small'
          type='number'
          value={order}
          onChange={(e) => setOrder(e.target.value === '' ? '' : Number(e.target.value))}
          onBlur={handleOrderChange}
          placeholder='#'
          sx={{ width: 70 }}
        />
        <Autocomplete
          size='small'
          value={selectedDance}
          onChange={(_, value) => handleDanceSelect(value)}
          options={availableOptions}
          getOptionLabel={dance => dance.title}
          renderInput={(params) => (
            <TextField {...params} placeholder='Add dance...' />
          )}
          sx={{ flex: 1 }}
        />
        <IconButton onClick={handleAdd} disabled={!selectedDance || order === ''} color='primary'>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const computeDisplayedRelations = ({ programDances, dances, pending }: {
  programDances: Program['programs_dances'],
  dances: Dance[],
  pending: {
    pendingAdds: { danceId: number; order: number }[],
    pendingRemoves: number[]
  }
}) => {
  const withoutRemovedDances = programDances
    .filter(pd => !pending.pendingRemoves.includes(pd.dance.id))
    .map(pd => ({ danceId: pd.dance.id, order: pd.order, title: pd.dance.title, isPending: false }));

  const addedDances = pending.pendingAdds.map(({ danceId, order }) => {
    const dance = dances.find(d => d.id === danceId);
    return { danceId, order, title: dance?.title ?? '?', isPending: true };
  });

  return [...withoutRemovedDances, ...addedDances]
    .sort((a, b) => a.order - b.order);
};

const computeAvailableOptions = ({ programDances, dances, pending }: {
  programDances: Program['programs_dances'],
  dances: Dance[],
  pending: {
    pendingAdds: { danceId: number; order: number }[],
    pendingRemoves: number[]
  }
}) => {
  const linkedIds = new Set(
    programDances
      .map(pd => pd.dance.id)
      .filter(id => !pending.pendingRemoves.includes(id))
      .concat(pending.pendingAdds.map(pa => pa.danceId))
  );

  return (dances ?? [])
    .filter(d => !linkedIds.has(d.id))
    .sort((a, b) => a.title.localeCompare(b.title));
};
