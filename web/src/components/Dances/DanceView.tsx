import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useConfirm } from 'material-ui-confirm';
import { ExternalLink } from '@/components/shared';
import { RelationCell } from '@/components/RelationCell';
import { newRecord } from './config';
import { useDeleteDance } from '@/hooks/useDances';
import { useNotify } from '@/hooks/useNotify';
import { useTitle } from '@/contexts/TitleContext';
import { useUndoActions, dbRecord, relationOps } from '@/contexts/UndoContext';
import type { Dance } from '@/lib/types/database';

export const DanceViewMode = ({ dance, onEdit }: { dance: Dance; onEdit: () => void }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { toastSuccess } = useNotify();
  const { pushAction } = useUndoActions();
  const { mutateAsync: deleteDance } = useDeleteDance();
  const { setTitle } = useTitle();

  useEffect(() => setTitle(`Dance: ${dance.title}`), [setTitle, dance.title]);

  const handleDelete = async () => {
    const { confirmed } = await confirm({
      title: 'Delete Dance',
      description: `Are you sure you want to delete "${dance.title}"?`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
    });
    if (!confirmed) return;
    await deleteDance({ id: dance.id });
    pushAction({
      label: `Delete Dance: ${dance.title}`,
      ops: [
        { type: 'delete', table: 'dances', id: dance.id, record: dbRecord(dance, newRecord) },
        ...relationOps('dances_choreographers', [],
          dance.dances_choreographers.map(dc => ({ id: dc.id, dance_id: dance.id, choreographer_id: dc.choreographer.id }))),
        ...relationOps('dances_key_moves', [],
          dance.dances_key_moves.map(dkm => ({ id: dkm.id, dance_id: dance.id, key_move_id: dkm.key_move.id }))),
        ...relationOps('dances_vibes', [],
          dance.dances_vibes.map(dv => ({ id: dv.id, dance_id: dance.id, vibe_id: dv.vibe.id }))),
        ...relationOps('programs_dances', [],
          dance.programs_dances.map(pd => ({ id: pd.id, dance_id: dance.id, program_id: pd.program.id, order: pd.order }))),
      ],
    });
    toastSuccess('Dance deleted');
    navigate('/dances');
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dances')} size='small' sx={{ mb: 1 }}>
        Dances
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant='h5'>{dance.title}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 2 }}>
          <Button variant='contained' color='warning' startIcon={<EditIcon />} onClick={onEdit}>Edit</Button>
          <Button variant='contained' color='error' startIcon={<DeleteIcon />} onClick={handleDelete}>Delete</Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1.5}>
        <Field label='Choreographers'>{dance.dances_choreographers.map(dc => dc.choreographer.name).join(', ')}</Field>
        <Field label='Dance Type'>{dance.dance_type?.name}</Field>
        <Field label='Formation'>{dance.formation?.name}</Field>
        <Field label='Progression'>{dance.progression?.name}</Field>
        <Field label='Difficulty'>{dance.difficulty?.toString()}</Field>
        <Field label='16-beat swing?'>
          {dance.swing_16 === true ? 'Yes' : dance.swing_16 === false ? 'No' : undefined}
        </Field>
        <Field label='Key Moves'>{dance.dances_key_moves.map(dkm => dkm.key_move.name).join(', ')}</Field>
        <Field label='Vibes'>{dance.dances_vibes.map(dv => dv.vibe.name).join(', ')}</Field>
        <Field label='URL'>{dance.url ? <ExternalLink url={dance.url} title={dance.url} /> : undefined}</Field>
        <Field label='Video'>{dance.video ? <ExternalLink url={dance.video} title='Video' /> : undefined}</Field>
        <Field label='Notes'>{dance.notes}</Field>
        <Field label='Place in Program'>{dance.place_in_program}</Field>
        <Field label='Moves'>{dance.moves}</Field>
        <Field label='Programs'>
          <RelationCell
            items={dance.programs_dances}
            model='program'
            getId={pd => pd.program.id}
            getLabel={pd => `${pd.program.date} – ${pd.program.location}`}
          />
        </Field>
        {dance.figures.length > 0 && (
          <Box>
            <Typography variant='caption' color='text.secondary'>Figures</Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {dance.figures.map((figure, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                  <Typography sx={{ width: 28, flexShrink: 0 }}>{figure.phrase}</Typography>
                  <Typography sx={{ width: 24, flexShrink: 0 }}>{figure.beats ?? ''}</Typography>
                  <Typography>{figure.description}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        <Field label='Date Added'>{new Date(dance.created_at).toISOString().split('T')[0]}</Field>
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
