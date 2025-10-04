import React, { useState, useCallback, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../app/store/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * Google Sign-In Button Component
 * Uses Google Identity Services (GIS) to handle OAuth2 authentication
 * Matches Microsoft button styling for consistency
 */
const GoogleLoginButton = ({ onError, onLoading, disabled }) => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Load Google Identity Services
  useEffect(() => {
    if (window.google || !GOOGLE_CLIENT_ID) {
      setGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      setGoogleLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setIsLoading(true);
      if (onLoading) onLoading(true);

      // Send the Google ID token to our backend
      const backendResponse = await api.post('/auth/oauth2/google', {
        idToken: response.credential
      });

      if (backendResponse.data.token && backendResponse.data.user) {
        // Store JWT token and user information
        setToken(backendResponse.data.token);
        setUser(backendResponse.data.user);
        
        // Navigate to dashboard
        navigate('/app/dashboard', { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Google authentication failed';
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
      if (onLoading) onLoading(false);
    }
  }, [navigate, setToken, setUser, onError, onLoading]);

  const handleGoogleLogin = useCallback(() => {
    if (!googleLoaded || !window.google || isLoading || disabled) {
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not configured');
      if (onError) onError('Google authentication is not configured');
      return;
    }

    try {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });

      // Show the One Tap prompt or popup
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if One Tap is not available
          window.google.accounts.id.renderButton(
            document.createElement('div'),
            { theme: 'outline', size: 'large' }
          );
        }
      });
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) onError('Failed to initiate Google sign-in');
    }
  }, [googleLoaded, isLoading, disabled, GOOGLE_CLIENT_ID, handleGoogleResponse, onError]);

  // Don't render if Google OAuth is not configured
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading || !googleLoaded}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      type="button"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700 font-medium">Signing in...</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;
