import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RelationCell } from '@/components/RelationCell';
import { useTitle } from '@/contexts/TitleContext';
import { formatLocalDate } from '@/lib/utils';
import type { Program } from '@/lib/types/database';

export const ProgramViewMode = ({ program, onEdit }: { program: Program; onEdit: () => void }) => {
  const navigate = useNavigate();
  const { setTitle } = useTitle();

  useEffect(() => setTitle(`Program: ${program.date ? formatLocalDate(program.date) : 'unknown'}`), [setTitle, program.date]);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>

      {/* Nav + actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/programs')} size='small'>
          Programs
        </Button>
        <Tooltip title='Edit'>
          <IconButton onClick={onEdit} size='small'><EditIcon fontSize='small' /></IconButton>
        </Tooltip>
      </Box>

      {/* Title */}
      <Box sx={{ mb: 2 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {formatDate(program) || 'No date'}
        </Typography>
        {program.location && (
          <Typography variant='subtitle1' color='text.secondary' sx={{ mt: 0.5 }}>
            {program.location}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2}>
        <Box>
          <Typography variant='overline' color='text.secondary'>Dances</Typography>
          <Box sx={{ mt: 0.5 }}>
            <RelationCell
              items={program.programs_dances}
              model='dance'
              getId={pd => pd.dance.id}
              getLabel={pd => `${pd.order} – ${pd.dance.title}`}
            />
          </Box>
        </Box>
      </Stack>

    </Box>
  );
};

const formatDate = (program: { date?: string | null }) =>
  program.date ? formatLocalDate(program.date) : '';
