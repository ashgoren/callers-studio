import { useDances } from '../hooks/useDances';

export const Dances = () => {
  const { data: dances, error, isLoading } = useDances();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading dances: {(error as Error).message}</div>;
  }

  return (
    <div>
      <h1>Dances</h1>
      <ul>
        {dances?.map((dance) => (
          <li key={dance.id}>{dance.title}</li>
        ))}
      </ul>
    </div>
  );
};
