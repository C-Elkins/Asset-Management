import React, { useEffect } from 'react';
import './App.css';
import { HomePage } from './pages/HomePage.jsx';
import { Login } from './components/auth/Login.jsx';
import { Dashboard } from './components/dashboard/Dashboard.jsx';
import { AssetsPage } from './pages/AssetsPage.jsx';
import { AssetDetails } from './pages/AssetDetails.jsx';
import { AssetCreatePage } from './pages/AssetCreatePage.jsx';
import { AssetAssignPage } from './pages/AssetAssignPage.jsx';
import { MaintenancePage } from './pages/MaintenancePage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { AIAssistant } from './pages/AIAssistant.jsx';
import ComponentShowcase from './pages/ComponentShowcase.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { useAuthStore } from './app/store/authStore.ts';
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/new" element={<AssetCreatePage />} />
          <Route path="assets/:id" element={<AssetDetails />} />
        <Route path="assets/:id/assign" element={<AssetAssignPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="ai" element={<AIAssistant />} />
          <Route path="showcase" element={<ComponentShowcase />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Default redirect based on auth */}
        <Route
          path="*"
          element={<Navigate to={user ? '/app' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
