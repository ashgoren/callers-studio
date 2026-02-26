import { useState } from 'react';
import { Box, Chip, IconButton, Typography, TextField, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
  const [showAdd, setShowAdd] = useState(false);

  const displayedRelations = computeDisplayedRelations(props);
  const availableOptions = computeAvailableOptions(props);

  return (
    <Box>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: 0.5 }}
      >
        {label}
      </Typography>

      {/* Chips */}
      {displayedRelations.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {displayedRelations.map((relation) => (
            <Chip
              key={relation.id}
              label={relation.label}
              size='small'
              onDelete={() => pending.removeItem(relation.id)}
              sx={{ opacity: relation.isPending ? 0.5 : 1 }}
            />
          ))}
        </Box>
      )}

      {/* Add control */}
      {showAdd ? (
        <Autocomplete
          size='small'
          value={undefined}
          inputValue={inputValue}
          onInputChange={(_, value) => setInputValue(value)}
          onChange={(_, option) => {
            if (option) {
              pending.addItem(getOptionId(option));
              setInputValue('');
              setShowAdd(false);
            }
          }}
          onBlur={() => { setShowAdd(false); setInputValue(''); }}
          options={availableOptions}
          getOptionLabel={getOptionLabel}
          renderInput={(params) => (
            <TextField {...params} placeholder={`Add ${model}…`} variant='standard' autoFocus />
          )}
          sx={{ mt: 0.5 }}
          disableClearable
        />
      ) : (
        <IconButton
          size='small'
          onClick={() => setShowAdd(true)}
          sx={{ mt: 0.25, opacity: 0.4, '&:hover': { opacity: 1 } }}
        >
          <AddIcon fontSize='small' />
        </IconButton>
      )}
    </Box>
  );
};

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
