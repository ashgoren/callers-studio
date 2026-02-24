import { useState } from 'react';
import { useParams } from 'react-router';
import { Spinner, ErrorMessage } from '@/components/shared';
import { useProgram } from '@/hooks/usePrograms';
import { ProgramViewMode } from './ProgramView';
import { ProgramEditMode } from './ProgramEdit';

// Routing wrapper

export const ProgramPage = () => {
  const { id } = useParams();
  if (id === 'new') return <ProgramEditMode />;
  return <ProgramDetailPage id={Number(id!)} />;
};

// Detail page with view/edit toggle

const ProgramDetailPage = ({ id }: { id: number }) => {
  const { data: program, isLoading, error } = useProgram(id);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!program) return <ErrorMessage error={new Error('Program not found')} />;

  if (isEditing) return <ProgramEditMode program={program} onCancel={() => setIsEditing(false)} />;
  return <ProgramViewMode program={program} onEdit={() => setIsEditing(true)} />;
};
