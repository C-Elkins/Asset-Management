import React from 'react';
import { Header } from '../components/common/Header.jsx';
import { Sidebar } from '../components/common/Sidebar.jsx';
import { Footer } from '../components/common/Footer.jsx';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';

export const HomePage = ({ user, onLogout }) => {
  const location = useLocation();
  return (
    <div className="home-layout">
      <Sidebar />
      <div className="main-content">
        <Header user={user} onLogout={onLogout} />
        <main className="page-content">
          {/* Nested routes will render here; error boundary resets on route change */}
          <ErrorBoundary key={location.pathname} onReset={() => { /* no-op reset */ }}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </div>
  );
};
