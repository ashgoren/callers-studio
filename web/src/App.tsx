import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { TitleProvider } from './contexts/TitleContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { UndoProvider } from '@/contexts/UndoContext';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import { Layout } from './components/layouts/Layout';
import { Dances } from './components/Dances';
import { Programs } from './components/Programs';
import { Choreographers } from './components/Choreographers';
import { Spinner } from '@/components/shared';
import { SignInPage } from '@/components/auth/SignInPage';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmProvider } from 'material-ui-confirm';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { logEnvironment } from './lib/utils';

const ProtectedRoute = () => {
  const { user, authLoading } = useAuth();
  if (authLoading) return <Spinner />;
  if (!user) return <Navigate to='/signin' />;
  return <Outlet />;
};

function App() {
  logEnvironment();
  const { user } = useAuth();
  useRealtimeSync(user);

  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DndProvider backend={HTML5Backend}>
          <QueryClientProvider client={queryClient}>
            <DrawerProvider>
              <UndoProvider>
                <TitleProvider>
                  <ConfirmProvider>
                    <Layout>
                      <Routes>
                        <Route path='/signin' element={<SignInPage />} />
                        <Route element={<ProtectedRoute />}>
                          <Route path='/' element={<Navigate to='/dances' />} />
                          <Route path='/dances' element={<Dances />} />
                          <Route path='/programs' element={<Programs />} />
                          <Route path='/choreographers' element={<Choreographers />} />
                        </Route>
                      </Routes>
                    </Layout>
                  </ConfirmProvider>
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
