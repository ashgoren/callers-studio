import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { TitleProvider } from './contexts/TitleContext';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './components/Layout';
import { Dances } from './components/Dances';
import { Programs } from './components/Programs';
import { Home } from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TitleProvider>
          <Layout>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/dances' element={<Dances />} />
              <Route path='/programs' element={<Programs />} />
            </Routes>
          </Layout>
        </TitleProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
