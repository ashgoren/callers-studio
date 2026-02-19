import { useState } from 'react';
import { formatQuery } from 'react-querybuilder';
import { parseSQL } from 'react-querybuilder/parseSQL';
import { Box, Button, Collapse, Paper } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { ModeToggle } from './ModeToggle';
import { VisualQueryBuilder } from './VisualQueryBuilder';
import { SQLEditor } from './SQLEditor';
import { removeEmptyRules } from './utils';
import type { Field, RuleGroupType } from 'react-querybuilder';

type QueryMode = 'visual' | 'sql';

type QueryBuilderComponentProps = {
  fields: Field[];
  defaultQuery: RuleGroupType;
  query: RuleGroupType;
  onQueryChange: (query: RuleGroupType) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
};

export const QueryBuilderComponent = ({ fields, defaultQuery, query, onQueryChange, filterOpen, setFilterOpen }: QueryBuilderComponentProps) => {
  const [mode, setMode] = useState<QueryMode>('visual');
  const [sqlText, setSqlText] = useState('');
  const [sqlError, setSqlError] = useState<string | null>(null);
  const confirm = useConfirm();

  // Sync SQL when switching to SQL mode
  const handleModeChange = (newMode: QueryMode) => {
    if (newMode === 'sql') {
      const cleanedQuery = removeEmptyRules(query);
      setSqlText(cleanedQuery.rules.length ? formatQuery(cleanedQuery, 'sql') : '');
      setSqlError(null);
    }
    setMode(newMode);
  };

  // Parse SQL back to query
  const applySql = () => {
    if (!sqlText.trim()) {
      onQueryChange(defaultQuery);
      setSqlError(null);
      return;
    }
    try {
      const parsed = parseSQL(sqlText);
      onQueryChange(parsed);
      setSqlError(null);
    } catch {
      setSqlError('Invalid SQL syntax');
    }
  };

  const handleClearFilters = async () => {
    const { confirmed } = await confirm({
      title: 'Clear Filters',
      description: 'Are you sure you want to clear all filters?',
      confirmationText: 'Clear',
      cancellationText: 'Cancel',
    });
    if (!confirmed) return;
    onQueryChange(defaultQuery);
    setFilterOpen(false);
    setSqlText('');
    setSqlError(null);
    setMode('visual');
  };

  return (
    <Collapse in={filterOpen}>
      <Paper sx={{ mb: 2, p: 2, boxShadow: 3, borderRadius: 2, backgroundColor: 'action.hover' }}>
        <ModeToggle mode={mode} handleModeChange={handleModeChange} />

        {mode === 'visual' ?
          <VisualQueryBuilder fields={fields} query={query} onQueryChange={onQueryChange} />
        :
          <SQLEditor sqlText={sqlText} setSqlText={setSqlText} sqlError={sqlError} applySql={applySql} />
        }

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button size='small' color='warning' onClick={handleClearFilters}>Clear filters</Button>
        </Box>
      </Paper>
    </Collapse>
  );
};
