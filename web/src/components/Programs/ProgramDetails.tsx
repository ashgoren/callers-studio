import { Spinner, ErrorMessage } from '@/components/shared';
import { useProgram } from '@/hooks/usePrograms';
import { columns } from '../Programs/columns';
import { DetailPanel } from '@/components/DetailPanel';
import { dateToLocaleString } from '@/lib/utils';

export const ProgramDetails = ({ id }: { id: number }) => {
  const { data: program, isLoading, error } = useProgram(Number(id));

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!program) return <ErrorMessage error={new Error('Program not found')} />;

  return (
    <DetailPanel
      data={program}
      columns={columns}
      title={`Program: ${program.date ? dateToLocaleString(new Date(program.date)) : ''}`}
    />
  );
};
