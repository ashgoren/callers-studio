import { Box, Button } from '@mui/material';
import { FilterButton } from '@/components/QueryBuilder/FilterButton';
import { countActiveRules } from '@/components/QueryBuilder/utils';
import { clearPersistence } from '@/hooks/usePersistence';
import type { RuleGroupType } from 'react-querybuilder';
import type { Dispatch, SetStateAction } from 'react';

export const TableControls = ({ tableName, query, setFilterOpen }: {
  tableName: string;
  query: RuleGroupType;
  setFilterOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleClearState = () => {
    if (window.confirm('Are you sure you want to clear all state, including filters, sort, etc?')) {
      clearPersistence(`mrt_${tableName}`);
      window.location.reload();
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <FilterButton
        onClick={() => setFilterOpen((prev: boolean) => !prev)}
        activeRuleCount={countActiveRules(query.rules)}
      />
      <Button size='small' color='error' onClick={handleClearState}>Clear all state</Button>
    </Box>
  );
};