import { useNotify } from '@/hooks/useNotify';
import { useProgram, useCreateProgram, useUpdateProgram, useDeleteProgram } from '@/hooks/usePrograms';
import { Spinner, ErrorMessage } from '@/components/shared';
import { columns, newRecord } from './config';
import { usePendingRelations } from '@/hooks/usePendingRelations';
import { useDances } from '@/hooks/useDances';
import { useAddDanceToProgram, useRemoveDanceFromProgram } from '@/hooks/useProgramsDances';
import { RecordView } from '@/components/RecordView';
import { RecordEdit } from '@/components/RecordEdit';
import { ProgramDancesEditor } from './ProgramDancesEditor';
import { useDrawerState } from '@/contexts/DrawerContext';
import { useUndoActions, dbRecord, beforeValues, relationOps } from '@/contexts/UndoContext';
import { formatLocalDate } from '@/lib/utils';
import type { ProgramInsert, ProgramUpdate } from '@/lib/types/database';

export const Program = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { pushAction } = useUndoActions();
  const { toastSuccess } = useNotify();

  const { mutateAsync: createProgram } = useCreateProgram();
  const { mutateAsync: updateProgram } = useUpdateProgram();
  const { mutateAsync: deleteProgram } = useDeleteProgram();
  const { mutateAsync: addDance } = useAddDanceToProgram();
  const { mutateAsync: removeDance } = useRemoveDanceFromProgram();

  const { data: program, isLoading, error } = useProgram(Number(id));
  const { data: dances } = useDances();

  const pending = usePendingRelations<{ danceId: number; order: number }>({
    getId: ({ danceId }) => danceId,
  });

  const handleSave = async (updates: ProgramUpdate) => {
    const { id: programId} = mode === 'create'
      ? await createProgram(updates as ProgramInsert)
      : await updateProgram({ id: program!.id, updates });

    const { added, removed } = await pending.commitChanges(
      ({danceId, order}) => addDance({ programId, danceId, order }),
      (danceId) => removeDance({ programId, danceId })
    );

    if (mode === 'create') {
      pushAction({
        label: `Create Program: ${formatDate(updates)}`,
        ops: [
          {
            type: 'insert',
            table: 'programs',
            record: { id: programId, ...updates }
          },
          ...relationOps('programs_dances', added, [])
        ]
      });
      toastSuccess('Program created');
    }

    if (mode === 'edit') {
      pushAction({
        label: `Edit Program: ${formatDate(updates)}`,
        ops: [
          {
            type: 'update',
            table: 'programs',
            id: programId,
            before: beforeValues(program!, updates, newRecord),
            after: dbRecord(updates, newRecord)
          },
          ...relationOps('programs_dances', added, removed)
        ]
      });
      toastSuccess('Program updated');
    }
  };

  const handleDelete = async () => {
    if (!program) return;
    await deleteProgram({ id: program.id });
    pushAction({
      label: `Delete Program: ${formatDate(program)}`,
      ops: [
        {
          type: 'delete',
          table: 'programs',
          id: program.id,
          record: dbRecord(program, newRecord)
        },
        ...relationOps(
          'programs_dances',
          [],
          program.programs_dances.map(pd => ({ id: pd.id, program_id: program.id, dance_id: pd.dance.id, order: pd.order }))
        )
      ]
    });
    toastSuccess('Program deleted');
  };

  if (mode !== 'create') {
    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    if (!program) return <ErrorMessage error={new Error('Program not found')} />;
  }

  if (mode === 'view') {
    return (
      <RecordView
        data={program!}
        columns={columns}
        title={`Program: ${formatDate(program!)}`}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <RecordEdit
      data={program ?? newRecord}
      columns={columns}
      title={program ? `Edit Program: ${formatDate(program)}` : 'New Program'}
      onSave={handleSave}
      hasPendingRelationChanges={pending.hasPendingChanges}
      relationEditors={{
        dances: <ProgramDancesEditor
          programDances={program?.programs_dances ?? []}
          dances={dances ?? []}
          pending={pending}
        />,
      }}
    />
  );
};

const formatDate = (program: { date?: string | null }) =>
  program.date ? formatLocalDate(program.date) : '';
