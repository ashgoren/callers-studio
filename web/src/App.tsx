import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/api/react-query';
import { Dances } from './components/Dances';
import { Programs } from './components/Programs';
import { DancesPrograms } from './components/DancesPrograms';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dances />
      <Programs />
      <DancesPrograms />
    </QueryClientProvider>
  )
}

export default App
