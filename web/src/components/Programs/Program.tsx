import { useProgram, useCreateProgram, useUpdateProgram, useDeleteProgram } from '@/hooks/usePrograms';
import { Spinner, ErrorMessage } from '@/components/shared';
import { columns, newRecord } from './config';
import { usePendingRelations } from '@/hooks/usePendingRelations';
import { useDances } from '@/hooks/useDances';
import { useAddDanceToProgram, useRemoveDanceFromProgram } from '@/hooks/useProgramsDances';
import { RecordView } from '@/components/RecordView';
import { RecordEdit } from '@/components/RecordEdit';
import { RelationList } from '@/components/RelationList';
import { ProgramDancesEditor } from './ProgramDancesEditor';
import { useDrawerState } from '@/contexts/DrawerContext';
import { formatLocalDate } from '@/lib/utils';
import type { ProgramInsert, ProgramUpdate } from '@/lib/types/database';

export const Program = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();

  const { mutateAsync: createProgram } = useCreateProgram();
  const { mutateAsync: updateProgram } = useUpdateProgram();
  const { mutateAsync: deleteProgram } = useDeleteProgram();
  const { mutateAsync: addDance } = useAddDanceToProgram();
  const { mutateAsync: removeDance } = useRemoveDanceFromProgram();

  const { data: program, isLoading, error } = useProgram(Number(id));
  const { data: dances } = useDances();

  const {
    pendingAdds,
    pendingRemoves,
    addItem,
    removeItem,
    commitChanges,
    hasPendingChanges
  } = usePendingRelations<{ danceId: number; order: number }>({
    getIdFromAdd: ({ danceId }) => danceId,
  });

  const handleSave = async (updates: ProgramUpdate) => {
    const { id: programId} = mode === 'create'
      ? await createProgram(updates as ProgramInsert)
      : await updateProgram({ id: program!.id, updates });

    await commitChanges(
      ({danceId, order}) => addDance({ programId, danceId, order }),
      (danceId) => removeDance({ programId, danceId })
    );
  };

  if (mode === 'create') {
    return (
      <RecordEdit
        data={newRecord}
        columns={columns}
        title={'New Program'}
        onSave={handleSave}
        hasPendingRelationChanges={hasPendingChanges}
      >
        <ProgramDancesEditor
          programDances={[]}
          dances={dances ?? []}
          pendingAdds={pendingAdds}
          pendingRemoves={pendingRemoves}
          onAdd={addItem}
          onRemove={removeItem}
        />
      </RecordEdit>
    );
  }

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!program) return <ErrorMessage error={new Error('Program not found')} />;

  if (mode === 'edit') {
    return (
      <RecordEdit
        data={program}
        columns={columns}
        title={`Edit Program: ${formatDate(program)}`}
        onSave={handleSave}
        hasPendingRelationChanges={hasPendingChanges}
      >
        <ProgramDancesEditor
          programDances={program.programs_dances}
          dances={dances ?? []}
          pendingAdds={pendingAdds}
          pendingRemoves={pendingRemoves}
          onAdd={addItem}
          onRemove={removeItem}
        />
      </RecordEdit>
    );
  }

  return (
    <RecordView
      data={program}
      columns={columns}
      title={`Program: ${formatDate(program)}`}
      onDelete={() => deleteProgram({ id: id! })}
    >
      <RelationList
        model='dance'
        label='🔗 Dances'
        relations={program.programs_dances}
        getRelationId={(pd) => pd.dance.id}
        getRelationLabel={(pd) => `${pd.order} - ${pd.dance.title}`}
      />
    </RecordView>
  );
};

const formatDate = (program: { date?: string | null }) =>
  program.date ? formatLocalDate(program.date) : '';
