import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { ObjectsPage } from './pages/ObjectsPage';
import { ObjectDetailPage } from './pages/ObjectDetailPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { AllTasksPage } from './pages/AllTasksPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [dataVersion, setDataVersion] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onDataChanged={() => setDataVersion((v) => v + 1)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" key={dataVersion}>
        {children}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/objects"
            element={
              <ProtectedLayout>
                <ObjectsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/objects/:id"
            element={
              <ProtectedLayout>
                <ObjectDetailPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/tasks/:id"
            element={
              <ProtectedLayout>
                <TaskDetailPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedLayout>
                <AllTasksPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/my-tasks"
            element={
              <ProtectedLayout>
                <MyTasksPage />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/objects" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
