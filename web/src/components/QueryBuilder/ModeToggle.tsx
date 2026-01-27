import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

type QueryMode = 'visual' | 'sql';

export const ModeToggle = ({ mode, handleModeChange }: { mode: QueryMode; handleModeChange: (mode: QueryMode) => void }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
    <ToggleButtonGroup
      size='small'
      value={mode}
      exclusive
      onChange={(_event, value) => value && handleModeChange(value)}
    >
      <ToggleButton value='visual'>Visual</ToggleButton>
      <ToggleButton value='sql'>SQL</ToggleButton>
    </ToggleButtonGroup>
  </Box>
);
