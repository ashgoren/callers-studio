import { useState } from 'react';
import { useProgram, useCreateProgram, useUpdateProgram, useDeleteProgram } from '@/hooks/usePrograms';
import { Spinner, ErrorMessage } from '@/components/shared';
import { columns, newRecord } from './config';
import { useDances } from '@/hooks/useDances';
import { useAddDanceToProgram, useRemoveDanceFromProgram } from '@/hooks/useProgramsDances';
import { DetailPanel } from '@/components/DetailPanel';
import { EditPanel } from '@/components/EditPanel';
import { RelationList } from '@/components/RelationList';
import { ProgramDancesEditor } from './ProgramDancesEditor';
import { useDrawerState, useDrawerActions } from '@/contexts/DrawerContext';
import { formatLocalDate } from '@/lib/utils';
import type { ProgramInsert, ProgramUpdate } from '@/lib/types/database';

export const ProgramDetails = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { setMode, closeDrawer } = useDrawerActions();

  const [pendingAdds, setPendingAdds] = useState<{ danceId: number; order: number }[]>([]);
  const [pendingRemoves, setPendingRemoves] = useState<number[]>([]);

  const { data: dances } = useDances();
  const { mutate: addDance } = useAddDanceToProgram();
  const { mutate: removeDance } = useRemoveDanceFromProgram();

  const { mutateAsync: createProgram } = useCreateProgram();
  const { mutateAsync: updateProgram } = useUpdateProgram();
  const { mutateAsync: deleteProgram } = useDeleteProgram();

  const { data: program, isLoading, error } = useProgram(Number(id));

  const handleSave = async (updates: ProgramUpdate) => {
    await updateProgram({ id: program!.id, updates });

    await Promise.all([
      ...pendingAdds.map(({ danceId, order }) =>
        addDance({ programId: program!.id, danceId, order })
      ),
      ...pendingRemoves.map(danceId =>
        removeDance({ programId: program!.id, danceId })
      ),
    ]);
  };

  const handleCancel = () => {
    setPendingAdds([]);
    setPendingRemoves([]);
    setMode('view');
  };

  if (mode === 'create') {
    return (
      <EditPanel
        data={newRecord}
        columns={columns}
        title={'New Program'}
        onSave={(data: ProgramInsert) => createProgram(data)}
        hasPendingRelationChanges={pendingAdds.length > 0 || pendingRemoves.length > 0}
        onCancel={() => closeDrawer()}
      />
    );
  }

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!program) return <ErrorMessage error={new Error('Program not found')} />;

  if (mode === 'edit') {
    return (
      <EditPanel
        data={program}
        columns={columns}
        title={`Edit Program: ${formatDate(program)}`}
        onSave={handleSave}
        hasPendingRelationChanges={pendingAdds.length > 0 || pendingRemoves.length > 0}
        onCancel={handleCancel}
      >
        <ProgramDancesEditor
          program={program}
          dances={dances ?? []}
          pendingAdds={pendingAdds}
          pendingRemoves={pendingRemoves}
          onAdd={(danceId, order) => setPendingAdds((prev) => [...prev, { danceId, order }])}
          onRemove={(danceId) => {
            if (pendingAdds.find((pa) => pa.danceId === danceId)) {
              setPendingAdds((prev) => prev.filter((pa) => pa.danceId !== danceId));
            } else {
              setPendingRemoves((prev) => [...prev, danceId]);
            }
          }}
        />
      </EditPanel>
    );
  }

  return (
    <DetailPanel
      data={program}
      columns={columns}
      title={`Program: ${formatDate(program)}`}
      onEdit={() => setMode('edit')}
      onDelete={() => deleteProgram({ id: id! })}
    >
      <RelationList
        model='dance'
        label='🔗 Dances'
        relations={program.programs_dances}
        getRelationId={(pd) => pd.dance.id}
        getRelationLabel={(pd) => `${pd.order} - ${pd.dance.title}`}
      />
    </DetailPanel>
  );
};

const formatDate = (program: { date?: string | null }) =>
  program.date ? formatLocalDate(program.date) : '';
