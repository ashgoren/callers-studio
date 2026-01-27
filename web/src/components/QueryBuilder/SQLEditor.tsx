import { Box, TextField, Alert } from '@mui/material';

export const SQLEditor = ({ sqlText, setSqlText, sqlError, applySql }: {
  sqlText: string;
  setSqlText: (text: string) => void;
  sqlError: string | null;
  applySql: () => void;
}) => {
  return (
    <Box>
      <TextField
        fullWidth
        multiline
        autoFocus
        minRows={4}
        color='secondary'
        value={sqlText}
        onChange={(e) => setSqlText(e.target.value)}
        onBlur={applySql}
        sx={{
          fontFamily: 'monospace',
          '& .MuiInputBase-input': { fontFamily: 'monospace' },
          backgroundColor: 'background.paper',
        }}
      />
      {sqlError && <Alert severity='error'>{sqlError}</Alert>}
    </Box>
  );
};