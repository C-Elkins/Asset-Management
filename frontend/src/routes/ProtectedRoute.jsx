import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService.js';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authed = authService.isAuthenticated();

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
