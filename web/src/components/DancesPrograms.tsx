import { useDancesPrograms } from '../hooks/useDancesPrograms';

export const DancesPrograms = () => {
  const { data: dancesPrograms, error, isLoading } = useDancesPrograms();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading dances: {(error as Error).message}</div>;
  }

  return (
    <div>
      <h1>DancePrograms Join Table</h1>
      <ul>
        {dancesPrograms?.map((danceProgram) => (
          <li key={danceProgram.id}>dance_id {danceProgram.dance_id} / program_id {danceProgram.program_id} / order {danceProgram.order}</li>
        ))}
      </ul>
    </div>
  );
};
