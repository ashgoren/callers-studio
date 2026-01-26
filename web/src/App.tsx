import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { TitleProvider } from './contexts/TitleContext';
import { Layout } from './components/Layout';
import { Dances } from './components/Dances';
// import { Programs } from './components/Programs';
// import { DancesPrograms } from './components/DancesPrograms';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TitleProvider>
        <Layout>
          <Dances />
          {/* <Programs />
          <DancesPrograms /> */}
        </Layout>
      </TitleProvider>
    </QueryClientProvider>
  )
}

export default App
