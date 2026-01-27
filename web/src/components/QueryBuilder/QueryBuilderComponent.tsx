import { useState } from 'react';
import { formatQuery } from 'react-querybuilder';
import { parseSQL } from 'react-querybuilder/parseSQL';
import { Box, Button, Collapse, Paper } from '@mui/material';
import { FilterButton } from './FilterButton';
import { ModeToggle } from './ModeToggle';
import { VisualQueryBuilder } from './VisualQueryBuilder';
import { SQLEditor } from './SQLEditor';
import { defaultQuery } from './constants';
import { removeEmptyRules, countActiveRules } from './utils';
import type { QueryBuilderComponentProps } from './types';

type QueryMode = 'visual' | 'sql';

export const QueryBuilderComponent = ({ fields, query, onQueryChange }: QueryBuilderComponentProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [mode, setMode] = useState<QueryMode>('visual');
  const [sqlText, setSqlText] = useState('');
  const [sqlError, setSqlError] = useState<string | null>(null);

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

  const handleClearAll = () => {
    const confirmed = window.confirm('Are you sure you want to clear all filters?');
    if (!confirmed) return;
    onQueryChange(defaultQuery);
    setFilterOpen(false);
    setSqlText('');
    setSqlError(null);
    setMode('visual');
  };

  return (
    <>
      <FilterButton
        onClick={() => setFilterOpen(!filterOpen)}
        activeRuleCount={countActiveRules(query.rules)}
      />

      <Collapse in={filterOpen}>
        <Paper sx={styles}>
          <ModeToggle mode={mode} handleModeChange={handleModeChange} />

          {mode === 'visual' ?
            <VisualQueryBuilder fields={fields} query={query} onQueryChange={onQueryChange} />
          :
            <SQLEditor sqlText={sqlText} setSqlText={setSqlText} sqlError={sqlError} applySql={applySql} />
          }

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button size='small' color='error' onClick={handleClearAll}>Clear all</Button>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
};

const styles = {
  mb: 2,
  p: 2,
  boxShadow: 3,
  borderRadius: 2,
  minWidth: 500,
  backgroundColor: 'action.hover',
  '& .rule': { 
    display: 'flex', 
    gap: 2,
    alignItems: 'center' 
  },
  '& .ruleGroup-header': { 
    display: 'flex', 
    gap: 2, 
    alignItems: 'center' 
  },
  '& .ruleGroup-body': { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 2,
    pt: 2,
  },
  '& .ruleGroup': { 
    mt: 2,
    p: 2,
    borderLeft: '3px solid',
    borderColor: 'secondary.main',
    backgroundColor: 'background.paper',
    borderRadius: 1,
  },
  '& .ruleGroup .ruleGroup': {
    backgroundColor: 'action.selected',
    borderColor: 'primary.main'
  },
  '& .ruleGroup .ruleGroup .ruleGroup': {
    backgroundColor: 'background.paper',
  },
  '& > .ruleGroup': { 
    mt: 0,
    p: 0,
    borderLeft: 'none',
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  '& .betweenRules': { my: 1 },
  '& .rule-fields': { width: 150, flexShrink: 0 },
  '& .rule-operators': { width: 180, flexShrink: 0 },
  '& .rule-value': { width: 200, flexShrink: 0 },
}
