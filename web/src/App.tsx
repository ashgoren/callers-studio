import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { TitleProvider } from './contexts/TitleContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './components/Layout';
import { Dances } from './components/Dances';
import { Programs } from './components/Programs';
import { Home } from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DndProvider backend={HTML5Backend}>
          <QueryClientProvider client={queryClient}>
            <TitleProvider>
              <DrawerProvider>
                <Layout>
                  <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/dances' element={<Dances />} />
                    <Route path='/programs' element={<Programs />} />
                  </Routes>
                </Layout>
              </DrawerProvider>
            </TitleProvider>
          </QueryClientProvider>
        </DndProvider>
      </LocalizationProvider>
    </BrowserRouter>
  )
}

export default App
