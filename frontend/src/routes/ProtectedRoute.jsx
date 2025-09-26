import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore';
// authDebug removed

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authed = useAuthStore(s => s.isAuthenticated);
  let tokenAuthed = false;
  try { tokenAuthed = !!localStorage.getItem('jwt_token'); } catch { tokenAuthed = false; }
  // Provide a brief grace window right after a successful login to avoid redirect bounce
  let justLoggedIn = false;
  try {
    const ts = Number(sessionStorage.getItem('JUST_LOGGED_IN') || 0);
    if (ts && Date.now() - ts < 5000) justLoggedIn = true;
  } catch { /* noop */ }
  // Gate redirects until a minimal hydration pass completes
  let firstPass = false;
  try {
    if (!sessionStorage.getItem('PR_HYDRATED')) {
      sessionStorage.setItem('PR_HYDRATED', '1');
      firstPass = true;
    }
  } catch { /* noop */ }
  if (process.env.NODE_ENV === 'development') {
    // Debug visibility for redirect decisions
    console.debug('[ProtectedRoute] state', { authed, tokenAuthed, justLoggedIn, firstPass, path: location.pathname });
  }
  // authDebug removed
  // Allow a brief grace if a token exists but store hasn't flipped yet
  if (!authed && !tokenAuthed && !justLoggedIn && !firstPass) {
  // authDebug removed
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  // Once authenticated, clear the post-login marker
  if (authed || tokenAuthed) {
    try { sessionStorage.removeItem('JUST_LOGGED_IN'); } catch {}
  // authDebug removed
  }

  return children;
};
