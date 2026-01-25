import { Paper } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { Dances } from './components/Dances';
// import { Programs } from './components/Programs';
// import { DancesPrograms } from './components/DancesPrograms';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Paper sx={{ padding: 4, margin: 2, width: '95vw', boxSizing: 'border-box' }}>
        <Dances />
        {/* <Programs />
        <DancesPrograms /> */}
      </Paper>
    </QueryClientProvider>
  )
}

export default App
