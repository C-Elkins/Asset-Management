import React, { useEffect, useState } from 'react';
import './App.css';
import { HomePage } from './pages/HomePage.jsx';
import { Login } from './components/auth/Login.jsx';
import { Dashboard } from './components/dashboard/Dashboard.jsx';
import { AssetsPage } from './pages/AssetsPage.jsx';
import { AssetDetails } from './pages/AssetDetails.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { authService } from './services/authService.js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On load, check if a token exists
    if (authService.isAuthenticated()) {
      const info = authService.getUser();
      setUser(info || { authenticated: true });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    const info = authService.getUser();
    setUser(info || userData || { authenticated: true });
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
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
          <Route path="assets/:id" element={<AssetDetails />} />
          <Route path="maintenance" element={<div className="page-placeholder">Maintenance page coming soon...</div>} />
          <Route path="reports" element={<div className="page-placeholder">Reports page coming soon...</div>} />
          <Route path="settings" element={<div className="page-placeholder">Settings page coming soon...</div>} />
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
