import { useMemo } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ArrowUpward, ArrowDownward, Add, LibraryAdd, Close } from '@mui/icons-material';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { OperatorSelector } from './OperatorSelector';
import { combinators, operators, textOperators, numberOperators, booleanOperators, dateOperators } from './constants';
import type { Field, RuleGroupType, ShiftActionsProps, ActionProps } from 'react-querybuilder';

type QueryBuilderComponentProps = {
  fields: Field[];
  query: RuleGroupType;
  onQueryChange: (query: RuleGroupType) => void;
};

const ShiftActions = ({ shiftUp, shiftDown, shiftUpDisabled, shiftDownDisabled }: ShiftActionsProps) => (
  <>
    <IconButton size='small' onClick={shiftUp} disabled={shiftUpDisabled} sx={{ p: 0.25 }}>
      <ArrowUpward sx={{ fontSize: 16 }} />
    </IconButton>
    <IconButton size='small' onClick={shiftDown} disabled={shiftDownDisabled} sx={{ p: 0.25 }}>
      <ArrowDownward sx={{ fontSize: 16 }} />
    </IconButton>
  </>
);

const AddRuleAction = ({ handleOnClick, disabled }: ActionProps) => (
  <IconButton size='small' onClick={handleOnClick} disabled={disabled} sx={{ p: 0.25 }} title='Add rule'>
    <Tooltip title='Add rule'>
      <Add sx={{ fontSize: 18 }} />
    </Tooltip>
  </IconButton>
);

const AddGroupAction = ({ handleOnClick, disabled }: ActionProps) => (
  <IconButton size='small' onClick={handleOnClick} disabled={disabled} sx={{ p: 0.25 }} title='Add group'>
    <Tooltip title='Add group'>
      <LibraryAdd sx={{ fontSize: 18 }} />
    </Tooltip>
  </IconButton>
);

const RemoveAction = ({ handleOnClick, disabled }: ActionProps) => (
  <IconButton size='small' onClick={handleOnClick} disabled={disabled} sx={{ p: 0.25 }} title='Remove'>
    <Close sx={{ fontSize: 16 }} />
  </IconButton>
);

export const VisualQueryBuilder = ({ fields, query, onQueryChange }: QueryBuilderComponentProps) => {
  const context = useMemo(() => ({ query, onQueryChange }), [query, onQueryChange]);

  return (
    <Box sx={styles}>
      <QueryBuilderMaterial>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={onQueryChange}
          // enableDragAndDrop
          showShiftActions
          combinators={combinators}
          operators={operators}
          getOperators={getOperatorsForField}
          getDefaultOperator={getDefaultOperatorForField}
          getValueEditorType={getValueEditorTypeForField}
          getValues={getValuesForField}
          context={context}
          controlElements={{
            operatorSelector: OperatorSelector,
            shiftActions: ShiftActions,
            addRuleAction: AddRuleAction,
            addGroupAction: AddGroupAction,
            removeRuleAction: RemoveAction,
            removeGroupAction: RemoveAction,
          }}
        />
      </QueryBuilderMaterial>
    </Box>
  )
};

type FieldMisc = { fieldData: Field };

const getOperatorsForField = (field: string, misc: FieldMisc) => {
  if (!field) return operators;
  const { inputType } = misc.fieldData;
  if (inputType === 'string') return operators.filter(op => textOperators.includes(op.name));
  if (inputType === 'number') return operators.filter(op => numberOperators.includes(op.name));
  if (inputType === 'boolean') return operators.filter(op => booleanOperators.includes(op.name));
  if (inputType === 'date') return operators.filter(op => dateOperators.includes(op.name));
  return null;
};

const getDefaultOperatorForField = (field: string, misc: FieldMisc) => {
  if (!field) return '=';
  const { inputType } = misc.fieldData;
  if (inputType === 'string') return 'contains';
  if (inputType === 'number') return '=';
  if (inputType === 'boolean') return '=';
  return '=';
};

const getValueEditorTypeForField = (_field: string, _operator: string, misc: FieldMisc) => {
  return misc.fieldData.inputType === 'boolean' ? 'select' : 'text';
};

const getValuesForField = (_field: string, _operator: string, misc: FieldMisc) => {
  if (misc.fieldData.inputType === 'boolean') {
    return [{ name: 'true', label: 'TRUE' }];
    // return [{ name: 'true', label: 'TRUE' }, { name: 'false', label: 'FALSE' }];
  }
  return [];
};

const styles = {
  '& .rule': {
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    flexWrap: 'wrap',
    borderBottom: { xs: '1px solid', sm: 'none' },
    borderColor: { xs: 'divider', sm: 'transparent' },
    pb: { xs: 1, sm: 0 }
  },
  '& .ruleGroup-header': { display: 'flex', gap: 2, alignItems: 'center' },
  '& .betweenRules': { my: 1 },
  '& .rule-fields': { width: 150 },
  '& .rule-operators': { width: 180 },
  '& .rule-value': { width: 200 },
  '& .ruleGroup-body': { display: 'flex', flexDirection: 'column', gap: 2, pt: 2 },
  '& .ruleGroup': { mt: 2, p: 3, borderLeft: '3px solid', borderRadius: 1 },
  "& .ruleGroup:has(> .ruleGroup-header .ruleGroup-combinators input[value='and'])": { // AND groups
    // backgroundColor: alpha(theme.palette.text.primary, 0.04),
    backgroundColor: 'background.paper',
    borderColor: 'warning.main',
  },
  "& .ruleGroup:has(> .ruleGroup-header .ruleGroup-combinators input[value='or'])": { // OR groups
    // backgroundColor: alpha(theme.palette.text.primary, 0.1),
    backgroundColor: 'action.hover',
    borderColor: 'info.main',
  }
};
