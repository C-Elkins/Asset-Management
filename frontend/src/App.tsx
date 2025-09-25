import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from './shared/components/layout';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { useAuthStore } from './app/store';
import { LoadingSpinner } from './shared/components/ui';
import { Toaster } from './shared/components/toast';
import './styles/globals.css';

// Lazy load components for better performance
const AssetsPage = React.lazy(() => import('./features/assets/AssetsPage'));
const AssetDetails = React.lazy(() => import('./features/assets/AssetDetails'));
const MaintenancePage = React.lazy(() => import('./features/maintenance/MaintenancePage'));
const ReportsPage = React.lazy(() => import('./features/reports/ReportsPage'));
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Shell with authentication state
const AppShell: React.FC = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();

  // Handle authentication persistence on app load
  React.useEffect(() => {
    // Token refresh logic would go here
    // For now, we'll just check if we have stored auth
    const storedAuth = localStorage.getItem('auth-store');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth.state?.isAuthenticated) {
          // Validate token or refresh if needed
        }
      } catch {
        // Clear invalid stored auth
        localStorage.removeItem('auth-store');
      }
    }
  }, []);

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LoadingSpinner size="md" color="white" />
          </motion.div>
          <p className="text-gray-600">Initializing Asset Manager...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Login />
              </motion.div>
            )
          } 
        />

        {/* Protected app routes */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppLayout user={user || undefined} onLogout={logout}>
                <React.Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="assets" element={<AssetsPage />} />
                    <Route path="assets/:id" element={<AssetDetails />} />
                    <Route path="maintenance" element={<MaintenancePage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </React.Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />}
        />
      </Routes>
    </AnimatePresence>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppShell />
        
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
