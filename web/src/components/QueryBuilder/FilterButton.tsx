import { Badge, Button, Typography } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

export const FilterButton = ({ onClick, activeRuleCount }: {
  onClick: () => void;
  activeRuleCount: number;
}) => (
  <Button
    sx={{ mb: 2 }}
    onClick={onClick}
    variant={activeRuleCount ? 'contained' : 'outlined'}
    color='secondary'
    startIcon={
      <Badge badgeContent={activeRuleCount} color='secondary'>
        {activeRuleCount ? <FilterAltIcon /> : <FilterAltOffIcon />}
      </Badge>
    }
  >
    <Typography sx={{ ml: 1 }}>Filters</Typography>
  </Button>
);
