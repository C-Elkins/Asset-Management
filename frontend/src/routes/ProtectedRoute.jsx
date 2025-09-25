import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore.ts';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authed = useAuthStore(s => s.isAuthenticated);

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
