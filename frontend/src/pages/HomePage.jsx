import React, { Suspense, useEffect, useState } from 'react';
import { Header } from '../components/common/Header.jsx';
import { Sidebar } from '../components/common/Sidebar.jsx';
import { Footer } from '../components/common/Footer.jsx';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';
import { ExecutivePageLoader } from '../components/common/ExecutiveLoader.jsx';
import { ToastProvider } from '../components/common/Toast.jsx';

export const HomePage = ({ user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mark session stabilized when home page mounts
  useEffect(() => {
    try { sessionStorage.setItem('AUTH_STABILIZED', '1'); } catch {}
  }, []);
  
  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <ToastProvider>
      <div id="app-root" className="home-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <Header user={user} onLogout={onLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <main className="page-content">
            {/* Nested routes will render here; error boundary resets on route change */}
            <ErrorBoundary key={location.pathname} onReset={() => { /* no-op reset */ }}>
              <Suspense fallback={<ExecutivePageLoader message="Loading module..." /> }>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
};
