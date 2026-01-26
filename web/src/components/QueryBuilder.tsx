import { useState } from 'react';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { Box, Typography, Button, Badge, Collapse, Paper } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import type { ColumnDef } from '@tanstack/react-table'
import type { Dance } from '@/lib/types/database';
import type { RuleGroupType } from 'react-querybuilder';

export const QueryBuilderComponent = ({ columns, query, onQueryChange }: {
  columns: ColumnDef<Dance, any>[],
  query: RuleGroupType,
  onQueryChange: (query: RuleGroupType) => void
}) => {
  const [filterOpen, setFilterOpen] = useState(false);

  const fields = columns
    .map(column => {
      const name = 'accessorKey' in column ? column.accessorKey : column.id!;
      return { name, label: column.header as string };
    });

  return (
    <Box sx={{ mb: 4 }}>
      <Button
        onClick={() => setFilterOpen((!filterOpen))}
        variant={countActiveRules(query.rules) ? 'contained' : 'outlined'}
        color={'secondary'}
        startIcon={
          <Badge badgeContent={countActiveRules(query.rules)} color='secondary'>
            {countActiveRules(query.rules) ? <FilterAltIcon /> : <FilterAltOffIcon />}
          </Badge>
        }
      >
        <Typography sx={{ ml: 1 }}>Filters</Typography>
      </Button>

      <Collapse in={filterOpen}>
        <Paper sx={{ 
          my: 4,
          p: 2,
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
            gap: 1.5,
            pt: 1.5,
          },
          '& .ruleGroup': { 
            mt: 3,
            pt: 2,
            borderLeft: '2px solid',
            borderColor: 'divider',
            pl: 2,
          },
          '& > .ruleGroup': { 
            mt: 0,
            pt: 0,
            borderLeft: 'none',
            pl: 0,
          },
          '& .rule-fields': { width: 150, flexShrink: 0 },
          '& .rule-operators': { width: 120, flexShrink: 0 },
          '& .rule-value': { width: 200, flexShrink: 0 },
        }}>
          <QueryBuilderMaterial>
            <QueryBuilder
              fields={fields}
              query={query}
              onQueryChange={onQueryChange}
              getDefaultOperator={() => 'contains'}
            />
          </QueryBuilderMaterial>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size='small' color='secondary' onClick={() => {
              onQueryChange({ combinator: 'and', rules: [] });
              setFilterOpen(false);
            }}>
              Clear all
            </Button>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

const countActiveRules = (rules: RuleGroupType['rules']): number => {
  return rules.reduce((count, rule) => {
    if ('combinator' in rule) {
      return count + countActiveRules(rule.rules); // Recursive case: it's a group
    }
    return count + (rule.value !== '' && rule.value != null ? 1 : 0); // Base case: it's a rule, count if value is non-empty
  }, 0);
};
