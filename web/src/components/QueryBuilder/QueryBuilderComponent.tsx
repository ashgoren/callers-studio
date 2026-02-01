import { useState } from 'react';
import { formatQuery } from 'react-querybuilder';
import { parseSQL } from 'react-querybuilder/parseSQL';
import { Box, Button, Collapse, Paper } from '@mui/material';
import { FilterButton } from './FilterButton';
import { ModeToggle } from './ModeToggle';
import { VisualQueryBuilder } from './VisualQueryBuilder';
import { SQLEditor } from './SQLEditor';
import { removeEmptyRules, countActiveRules } from './utils';
import { clearPersistence } from '@/hooks/usePersistence';
import type { Field, RuleGroupType } from 'react-querybuilder';

type QueryMode = 'visual' | 'sql';

type QueryBuilderComponentProps = {
  tableName: string;
  fields: Field[];
  defaultQuery: RuleGroupType;
  query: RuleGroupType;
  onQueryChange: (query: RuleGroupType) => void;
};

export const QueryBuilderComponent = ({ tableName, fields, defaultQuery, query, onQueryChange }: QueryBuilderComponentProps) => {
  const [filterOpen, setFilterOpen] = useState(countActiveRules(query.rules) > 0);
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

  const handleClearFilters = () => {
    const confirmed = window.confirm('Are you sure you want to clear all filters?');
    if (!confirmed) return;
    onQueryChange(defaultQuery);
    setFilterOpen(false);
    setSqlText('');
    setSqlError(null);
    setMode('visual');
  };

  const handleClearState = () => {
    const confirmed = window.confirm('Are you sure you want to clear all state, including filters, sort, etc?');
    if (!confirmed) return;
    clearPersistence(`mrt_${tableName}`);
    window.location.reload();
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <FilterButton
          onClick={() => setFilterOpen(!filterOpen)}
          activeRuleCount={countActiveRules(query.rules)}
        />
        <Button size='small' color='error' onClick={handleClearState}>Clear all state</Button>
      </Box>

      <Collapse in={filterOpen}>
        <Paper sx={{ mb: 2, p: 2, boxShadow: 3, borderRadius: 2, minWidth: 500, backgroundColor: 'action.hover' }}>
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
    </>
  );
};
