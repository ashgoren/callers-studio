import { useCreateProgram, useUpdateProgram, useDeleteProgram } from '@/hooks/usePrograms';
import { Spinner, ErrorMessage } from '@/components/shared';
import { useProgram } from '@/hooks/usePrograms';
import { columns, newRecord } from './config';
import { DetailPanel } from '@/components/DetailPanel';
import { EditPanel } from '@/components/EditPanel';
import { useDrawerState, useDrawerActions } from '@/contexts/DrawerContext';
import { formatLocalDate } from '@/lib/utils';
import type { ProgramInsert, ProgramUpdate } from '@/lib/types/database';

export const ProgramDetails = ({ id }: { id?: number }) => {
  const { mode } = useDrawerState();
  const { setMode, closeDrawer } = useDrawerActions();
  const { mutateAsync: createProgram } = useCreateProgram();
  const { mutateAsync: updateProgram } = useUpdateProgram();
  const { mutateAsync: deleteProgram } = useDeleteProgram();
  const { data: program, isLoading, error } = useProgram(Number(id));

  if (mode === 'create') {
    return (
      <EditPanel
      data={newRecord}
      columns={columns}
      title={'New Program'}
      onSave={(data: ProgramInsert) => createProgram(data)}
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
        onSave={(updates: ProgramUpdate) => updateProgram({ id: id!, updates })}
        onCancel={() => setMode('view')}
      />
    );
  }

  return (
    <DetailPanel
      data={program}
      columns={columns}
      title={`Program: ${formatDate(program)}`}
      onEdit={() => setMode('edit')}
      onDelete={() => deleteProgram({ id: id! })}
    />
  );
};

const formatDate = (program: { date?: string | null }) =>
  program.date ? formatLocalDate(program.date) : '';
