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
const AdminPage = lazy(() => import('./pages/AdminPage.jsx').then(m => ({ default: m.default })));
const AIAssistant = lazy(() => import('./pages/AIAssistant.jsx').then(m => ({ default: m.AIAssistant })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx').then(m => ({ default: m.default || m.PrivacyPage })));
const BillingPage = lazy(() => import('./pages/BillingPage.jsx').then(m => ({ default: m.default })));
const AdminCustomizationCenter = lazy(() => import('./pages/AdminCustomizationCenter.jsx').then(m => ({ default: m.default })));

const NotFound = lazy(() => import('./pages/NotFound.jsx').then(m => ({ default: m.NotFound })));
import { useAuthStore } from './app/store/authStore';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { ExecutivePageLoader } from './components/common/ExecutiveLoader.jsx';
import { MinimalPageLoader } from './components/common/MinimalPageLoader.jsx';
const Signup = lazy(() => import('./pages/auth/Signup.jsx').then(m => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword.jsx').then(m => ({ default: m.ResetPassword })));
const MarketingHome = lazy(() => import('./pages/marketing/Home.jsx').then(m => ({ default: m.default || m.MarketingHome })));
const Pricing = lazy(() => import('./pages/marketing/Pricing.jsx').then(m => ({ default: m.default || m.Pricing })));
const About = lazy(() => import('./pages/marketing/About.jsx').then(m => ({ default: m.default || m.About })));
const Features = lazy(() => import('./pages/marketing/Features.jsx').then(m => ({ default: m.default || m.Features })));
const Solutions = lazy(() => import('./pages/marketing/Solutions.jsx').then(m => ({ default: m.default || m.Solutions })));
const Security = lazy(() => import('./pages/marketing/Security.jsx').then(m => ({ default: m.default || m.Security })));
const Integrations = lazy(() => import('./pages/marketing/Integrations.jsx').then(m => ({ default: m.default || m.Integrations })));
const Customers = lazy(() => import('./pages/marketing/Customers.jsx').then(m => ({ default: m.default || m.Customers })));
const Contact = lazy(() => import('./pages/marketing/Contact.jsx').then(m => ({ default: m.default || m.Contact })));

function App() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const initSession = useAuthStore(s => s.initSession);
  const logout = useAuthStore(s => s.logout);
  // If a token exists, treat as authenticated for routing purposes
  let tokenAuthed = false;
  try {
    tokenAuthed = !!localStorage.getItem('jwt_token');
  } catch {}

    // Debug auth state changes (removed for production)

  useEffect(() => { initSession(); }, [initSession]);

  const handleLogout = () => { logout(); };

  // Note: Do not block initial render with a global loader so that public routes like /login
  // can render their headings immediately for accessibility and E2E stability. App routes
  // are already guarded with loading state inside ProtectedRoute.

  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing pages */}
        <Route
          path="/"
          element={(user || tokenAuthed)
            ? <Navigate to="/app/dashboard" replace />
            : <Suspense fallback={<MinimalPageLoader />}><MarketingHome /></Suspense>}
        />
        <Route path="/features" element={(user || tokenAuthed) ? <Navigate to="/app/dashboard" replace /> : <Suspense fallback={<MinimalPageLoader />}><Features /></Suspense>} />
        <Route path="/solutions" element={(user || tokenAuthed) ? <Navigate to="/app/dashboard" replace /> : <Suspense fallback={<MinimalPageLoader />}><Solutions /></Suspense>} />
        <Route path="/security" element={(user || tokenAuthed) ? <Navigate to="/app/dashboard" replace /> : <Suspense fallback={<MinimalPageLoader />}><Security /></Suspense>} />
        <Route path="/integrations" element={(user || tokenAuthed) ? <Navigate to="/app/dashboard" replace /> : <Suspense fallback={<MinimalPageLoader />}><Integrations /></Suspense>} />
  <Route path="/customers" element={(user || tokenAuthed) ? <Navigate to="/app/dashboard" replace /> : <Suspense fallback={<MinimalPageLoader />}><Customers /></Suspense>} />
        <Route path="/contact" element={(user || tokenAuthed) ? <Navigate to="/app/dashboard" replace /> : <Suspense fallback={<MinimalPageLoader />}><Contact /></Suspense>} />
        <Route
          path="/pricing"
          element={(user || tokenAuthed)
            ? <Navigate to="/app/dashboard" replace />
            : <Suspense fallback={<MinimalPageLoader />}><Pricing /></Suspense>}
        />
        <Route
          path="/about"
          element={(user || tokenAuthed)
            ? <Navigate to="/app/dashboard" replace />
            : <Suspense fallback={<MinimalPageLoader />}><About /></Suspense>}
        />
  <Route
    path="/login"
    element={(user || tokenAuthed) ? <Navigate to="/app/dashboard" replace /> : <Login />}
  />
        <Route path="/signup" element={<Suspense fallback={<ExecutivePageLoader message="Opening signup…" />}><Signup /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<ExecutivePageLoader message="Opening forgot password…" />}><ForgotPassword /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<ExecutivePageLoader message="Opening reset password…" />}><ResetPassword /></Suspense>} />
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
          <Route path="privacy" element={<Suspense fallback={<ExecutivePageLoader message="Loading privacy..." />}><PrivacyPage /></Suspense>} />
          <Route path="billing" element={<Suspense fallback={<ExecutivePageLoader message="Loading billing..." />}><BillingPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<ExecutivePageLoader message="Loading settings..." />}><SettingsPage /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<ExecutivePageLoader message="Loading admin panel..." />}><AdminPage /></Suspense>} />
          <Route path="ai" element={<Suspense fallback={<ExecutivePageLoader message="Booting AI Assistant..." />}><AIAssistant /></Suspense>} />
          <Route path="showcase" element={<Suspense fallback={<ExecutivePageLoader message="Loading customization..." />}><AdminCustomizationCenter /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<ExecutivePageLoader message="Loading..." />}><NotFound /></Suspense>} />
        </Route>
        {/* Catch-all for truly unknown routes - 404 page */}
        <Route path="*" element={<Suspense fallback={<MinimalPageLoader />}><NotFound /></Suspense>} />
      </Routes>
  {/* AuthDebugPanel removed */}
    </BrowserRouter>
  );
}

export default App;
