import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore';
// authDebug removed

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authed = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);
  
  // During initial loading, show loading state
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  // Check for valid authentication
  let tokenExists = false;
  try { 
    tokenExists = !!localStorage.getItem('jwt_token'); 
  } catch { 
    tokenExists = false; 
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.debug('🛡️ [ProtectedRoute] Auth check:', { authed, tokenExists, path: location.pathname });
  }
  
  // If not authenticated and no token, redirect to login
  // But be more permissive - if we have a token, allow through even if authed is false (race condition)
  if (!authed && !tokenExists) {
    if (process.env.NODE_ENV === 'development') console.log('🚫 [ProtectedRoute] Redirecting to login - no auth and no token');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return children;
};
