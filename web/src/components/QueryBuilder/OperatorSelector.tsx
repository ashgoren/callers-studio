import { MaterialValueSelector } from '@react-querybuilder/material';
import { Box, IconButton } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { negativeOperators, operatorPairs } from './constants';
import type { MaterialValueSelectorProps } from '@react-querybuilder/material';

export const OperatorSelector = (props: MaterialValueSelectorProps) => {
  const operator = props.value as string;
  const options = props.options as { name: string, value: string, label: string }[];
  const isNegated = negativeOperators.includes(operator);
  const filteredOptions = options.filter(opt => negativeOperators.includes(opt.name) === isNegated);

  const toggleNegated = () => {
    if (operatorPairs[operator]) {
      props.handleOnChange(operatorPairs[operator]);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton size='small' onClick={toggleNegated}>
        <SwapHorizIcon fontSize='small' />
      </IconButton>
      <MaterialValueSelector {...props} options={filteredOptions} />
    </Box>
  );
};
