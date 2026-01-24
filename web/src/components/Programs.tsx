import { usePrograms } from '../hooks/usePrograms';

export const Programs = () => {
  const { data: programs, error, isLoading } = usePrograms();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading programs: {(error as Error).message}</div>;
  }

  return (
    <div>
      <h1>Programs</h1>
      <ul>
        {programs?.map((program) => (
          <li key={program.id}>{program.date} - {program.location}</li>
        ))}
      </ul>
    </div>
  );
};
