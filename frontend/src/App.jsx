import React, { useEffect, lazy, Suspense } from 'react';
import './App.css';
import { HomePage } from './pages/HomePage.jsx';
import { Login } from './components/auth/Login.jsx';
const Dashboard = lazy(() => import('./components/dashboard/Dashboard.jsx').then(m => ({ default: m.Dashboard })));
const AssetsPage = lazy(() => import('./pages/AssetsPage.jsx').then(m => ({ default: m.AssetsPage })));
const AssetDetails = lazy(() => import('./pages/AssetDetails.jsx').then(m => ({ default: m.AssetDetails })));
const AssetCreatePage = lazy(() => import('./pages/AssetCreatePage.jsx').then(m => ({ default: m.AssetCreatePage })));
const AssetAssignPage = lazy(() => import('./pages/AssetAssignPage.jsx').then(m => ({ default: m.AssetAssignPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage.jsx').then(m => ({ default: m.MaintenancePage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then(m => ({ default: m.SettingsPage })));
const AIAssistant = lazy(() => import('./pages/AIAssistant.jsx').then(m => ({ default: m.AIAssistant })));

const NotFound = lazy(() => import('./pages/NotFound.jsx').then(m => ({ default: m.NotFound })));
import { useAuthStore } from './app/store/authStore';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { ExecutivePageLoader } from './components/common/ExecutiveLoader.jsx';

function App() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const initSession = useAuthStore(s => s.initSession);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => { initSession(); }, [initSession]);

  const handleLogout = () => { logout(); };

  if (isLoading && !user) {
    return <ExecutivePageLoader message="Initializing Enterprise Portal..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
  <Route path="/login" element={<Login />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <HomePage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<ExecutivePageLoader message="Loading dashboard..." />}><Dashboard /></Suspense>} />
          <Route path="assets" element={<Suspense fallback={<ExecutivePageLoader message="Loading assets..." />}><AssetsPage /></Suspense>} />
          <Route path="assets/new" element={<Suspense fallback={<ExecutivePageLoader message="Loading form..." />}><AssetCreatePage /></Suspense>} />
          <Route path="assets/:id" element={<Suspense fallback={<ExecutivePageLoader message="Loading asset..." />}><AssetDetails /></Suspense>} />
          <Route path="assets/:id/assign" element={<Suspense fallback={<ExecutivePageLoader message="Loading assignment..." />}><AssetAssignPage /></Suspense>} />
          <Route path="maintenance" element={<Suspense fallback={<ExecutivePageLoader message="Loading maintenance..." />}><MaintenancePage /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<ExecutivePageLoader message="Loading reports..." />}><ReportsPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<ExecutivePageLoader message="Loading settings..." />}><SettingsPage /></Suspense>} />
          <Route path="ai" element={<Suspense fallback={<ExecutivePageLoader message="Booting AI Assistant..." />}><AIAssistant /></Suspense>} />
          <Route path="showcase" element={<Suspense fallback={<ExecutivePageLoader message="Loading showcase..." />}><div style={{padding: '2rem', textAlign: 'center'}}><h2>Component Showcase</h2><p>Coming Soon - UI Components Demo</p></div></Suspense>} />
          <Route path="*" element={<Suspense fallback={<ExecutivePageLoader message="Loading..." />}><NotFound /></Suspense>} />
        </Route>
        {/* Default redirect based on auth; allow E2E/test mode or token presence to land at /app */}
        <Route
          path="*"
          element={(() => {
            let tokenAuthed = false;
            try {
              tokenAuthed = !!localStorage.getItem('jwt_token');
            } catch {}
            const dest = (user || tokenAuthed) ? '/app' : '/login';
            return <Navigate to={dest} replace />;
          })()}
        />
      </Routes>
  {/* AuthDebugPanel removed */}
    </BrowserRouter>
  );
}

export default App;
