import { Box, Button } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { FilterButton } from '@/components/QueryBuilder/FilterButton';
import { countActiveRules } from '@/components/QueryBuilder/utils';
import { clearPersistence } from '@/hooks/usePersistence';
import type { RuleGroupType } from 'react-querybuilder';
import type { Dispatch, SetStateAction } from 'react';
import type { Model } from '@/lib/types/database';

export const TableControls = ({ model, query, setFilterOpen }: {
  model: Model;
  query: RuleGroupType;
  setFilterOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const confirm = useConfirm();

  const handleClearState = async () => {
    const { confirmed } = await confirm({
      title: 'Clear all state',
      description: 'Are you sure you want to clear all state, including filters, sort, etc?',
      confirmationText: 'Clear',
      cancellationText: 'Cancel',
    });
    if (!confirmed) return;
    clearPersistence(`mrt_${model}`);
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <FilterButton
        onClick={() => setFilterOpen((prev: boolean) => !prev)}
        activeRuleCount={countActiveRules(query.rules)}
      />

      <Button
        size='small'
        color='error'
        onClick={handleClearState}
      >
        Clear all state
      </Button>
    </Box>
  );
};