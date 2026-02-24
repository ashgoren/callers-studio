import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useConfirm } from 'material-ui-confirm';
import { RelationCell } from '@/components/RelationCell';
import { newRecord } from './config';
import { useDeleteProgram } from '@/hooks/usePrograms';
import { useNotify } from '@/hooks/useNotify';
import { useTitle } from '@/contexts/TitleContext';
import { useUndoActions, dbRecord, relationOps } from '@/contexts/UndoContext';
import { formatLocalDate } from '@/lib/utils';
import type { Program } from '@/lib/types/database';

export const ProgramViewMode = ({ program, onEdit }: { program: Program; onEdit: () => void }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { toastSuccess } = useNotify();
  const { pushAction } = useUndoActions();
  const { mutateAsync: deleteProgram } = useDeleteProgram();
  const { setTitle } = useTitle();

  useEffect(() => setTitle(`Program: ${program.date ? formatLocalDate(program.date) : 'unknown'}`), [setTitle, program.date]);

  const handleDelete = async () => {
    const { confirmed } = await confirm({
      title: 'Delete Program',
      description: `Are you sure you want to delete "${formatDate(program)}"?`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
    });
    if (!confirmed) return;
    await deleteProgram({ id: program.id });
    pushAction({
      label: `Delete Program: ${formatDate(program)}`,
      ops: [
        { type: 'delete', table: 'programs', id: program.id, record: dbRecord(program, newRecord) },
        ...relationOps('programs_dances', [],
          program.programs_dances.map(pd => ({ id: pd.id, program_id: program.id, dance_id: pd.dance.id, order: pd.order }))),
      ],
    });
    toastSuccess('Program deleted');
    navigate('/programs');
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/programs')} size='small' sx={{ mb: 1 }}>
        Programs
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant='h5'>{formatDate(program)}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 2 }}>
          <Button variant='contained' color='warning' startIcon={<EditIcon />} onClick={onEdit}>Edit</Button>
          <Button variant='contained' color='error' startIcon={<DeleteIcon />} onClick={handleDelete}>Delete</Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1.5}>
        <Field label='Location'>{program.location}</Field>
        <Field label='Dances'>
          <RelationCell
            items={program.programs_dances}
            model='dance'
            getId={pd => pd.dance.id}
            getLabel={pd => `${pd.order} – ${pd.dance.title}`}
          />
        </Field>
      </Stack>
    </Box>
  );
};

const Field = ({ label, children }: { label: string; children?: ReactNode }) => (
  <Box>
    <Typography variant='caption' color='text.secondary'>{label}</Typography>
    <Typography variant='body1' component='div'>
      {children ?? <Box component='span' sx={{ color: 'text.disabled' }}>—</Box>}
    </Typography>
  </Box>
);

const formatDate = (program: { date?: string | null }) =>
  program.date ? formatLocalDate(program.date) : '';
