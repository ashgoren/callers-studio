import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, TextField, Autocomplete } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { Model } from '@/lib/types/database';

type RelationEditorProps<TRelation, TOption> = {
  // Existing relations
  relations: TRelation[];                               // join table rows with related items embedded
  getRelationId: (relation: TRelation) => number;       // for key + remove
  getRelationLabel: (relation: TRelation) => string;    // display in list of current related items

  // Available options to add
  options: TOption[];                                   // available items to add (full objects of related model)
  getOptionId: (option: TOption) => number;             // for add
  getOptionLabel: (option: TOption) => string;          // display in autocomplete of available items to add

  // Pending changes management (ids of related items pending add/remove, and functions to update those)
  pending: {
    pendingAdds: number[];                              // relation ids pending add (not yet in relations)
    pendingRemoves: number[];                           // relation ids pending remove (not yet removed from relations)
    addItem: (id: number) => void;                      // add relation id to pendingAdds (and remove from pendingRemoves if present)
    removeItem: (id: number) => void;                   // add relation id to pendingRemoves (and remove from pendingAdds if present)
  };

  // Display
  model: Model;
  label: string;
};

export const RelationEditor = <TRelation, TOption>(props: RelationEditorProps<TRelation, TOption>) => {
  const { model, label, getOptionId, getOptionLabel, pending } = props;
  const [inputValue, setInputValue] = useState('');

  const displayedRelations = computeDisplayedRelations(props);
  const availableOptions = computeAvailableOptions(props);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <List dense>
        {displayedRelations.map((relation) => (
          <ListItem
            key={relation.id}
            sx={{
              p: 0,
              opacity: relation.isPending ? 0.6 : 1,
              '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
            }}
            secondaryAction={
              <IconButton edge='end' size='small' onClick={() => pending.removeItem(relation.id)}>
                <RemoveCircleOutlineIcon fontSize='small' />
              </IconButton>
            }
          >
            <ListItemText primary={relation.label} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
        <Autocomplete
          size='small'
          value={null}
          inputValue={inputValue}
          onInputChange={(_, value) => setInputValue(value)}
          onChange={(_, option) => {
            if (option) {
              pending.addItem(getOptionId(option));
              setInputValue('');
            }
          }}
          options={availableOptions}
          getOptionLabel={getOptionLabel}
          renderInput={(params) => (
            <TextField {...params} placeholder={`Add ${model}...`} />
          )}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
}

// existing relations + pendingAdds - pendingRemoves
const computeDisplayedRelations = <TRelation, TOption>(props: RelationEditorProps<TRelation, TOption>) => {
  const { relations, getRelationId, getRelationLabel, options, getOptionId, getOptionLabel, pending } = props;
  const withoutRemoved = relations
    .filter(r => !pending.pendingRemoves.includes(getRelationId(r)))
    .map(r => ({ id: getRelationId(r), label: getRelationLabel(r), isPending: false }));
    
  const added = pending.pendingAdds.map(id => {
    const option = options.find(o => getOptionId(o) === id);
    return { id, label: option ? getOptionLabel(option) : '?', isPending: true };
  });

  return [...withoutRemoved, ...added];
};

// options - existing relations - pendingAdds + pendingRemoves
const computeAvailableOptions = <TRelation, TOption>(props: RelationEditorProps<TRelation, TOption>) => {
  const { relations, getRelationId, options, getOptionId, getOptionLabel, pending } = props;
  const linkedIds = new Set([
    ...relations.map(r => getRelationId(r)).filter(id => !pending.pendingRemoves.includes(id)),
    ...pending.pendingAdds
  ]);
  
  return options
    .filter(o => !linkedIds.has(getOptionId(o)))
    .sort((a, b) => getOptionLabel(a).localeCompare(getOptionLabel(b)));
};
