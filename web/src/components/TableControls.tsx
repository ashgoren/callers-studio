import { Box, Button } from '@mui/material';
import { FilterButton } from '@/components/QueryBuilder/FilterButton';
import { countActiveRules } from '@/components/QueryBuilder/utils';
import { clearPersistence } from '@/hooks/usePersistence';
import { useDrawerActions } from '@/contexts/DrawerContext';
import type { RuleGroupType } from 'react-querybuilder';
import type { Dispatch, SetStateAction } from 'react';
import type { Model } from '@/lib/types/database';

export const TableControls = ({ model, query, setFilterOpen }: {
  model: Model;
  query: RuleGroupType;
  setFilterOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { openDrawerForNewRecord } = useDrawerActions();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <FilterButton
        onClick={() => setFilterOpen((prev: boolean) => !prev)}
        activeRuleCount={countActiveRules(query.rules)}
      />

      <Button
        variant='contained'
        color='primary'
        onClick={() => openDrawerForNewRecord(model)}
      >
        Add {model}
      </Button>

      <Button
        size='small'
        color='error'
        onClick={() => {
          if (window.confirm('Are you sure you want to clear all state, including filters, sort, etc?')) {
            clearPersistence(`mrt_${model}`);
            window.location.reload();
          }
        }}
      >
        Clear all state
      </Button>
    </Box>
  );
};