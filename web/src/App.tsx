import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { TitleProvider } from './contexts/TitleContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { UndoProvider } from '@/contexts/UndoContext';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './components/layouts/Layout';
import { Dances } from './components/Dances';
import { Programs } from './components/Programs';
import { Choreographers } from './components/Choreographers';
import { Home } from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DndProvider backend={HTML5Backend}>
          <QueryClientProvider client={queryClient}>
            <DrawerProvider>
              <UndoProvider>
                <TitleProvider>
                  <Layout>
                    <Routes>
                      <Route path='/' element={<Home />} />
                      <Route path='/dances' element={<Dances />} />
                      <Route path='/programs' element={<Programs />} />
                      <Route path='/choreographers' element={<Choreographers />} />
                    </Routes>
                  </Layout>
                </TitleProvider>
              </UndoProvider>
            </DrawerProvider>
          </QueryClientProvider>
        </DndProvider>
      </LocalizationProvider>
    </BrowserRouter>
  )
}

export default App
