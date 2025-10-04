import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/authStore';
import { api } from '../../services/api.js';

/**
 * Microsoft OAuth2 Login Button Component
 * 
 * Implements Microsoft/Azure AD authentication using MSAL (Microsoft Authentication Library).
 * Features:
 * - Official Microsoft button styling
 * - Popup-based authentication flow
 * - Automatic token exchange with backend
 * - Error handling and loading states
 */
const MicrosoftLoginButton = ({ disabled = false, onError, onLoading }) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [msalLoaded, setMsalLoaded] = useState(false);

  // Microsoft Azure AD configuration
  const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
  const MICROSOFT_TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common';
  const REDIRECT_URI = `${window.location.origin}/auth/microsoft/callback`;

  // Load MSAL library
  useEffect(() => {
    if (window.msal || !MICROSOFT_CLIENT_ID) {
      setMsalLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js';
    script.async = true;
    script.defer = true;
    script.onload = () => setMsalLoaded(true);
    script.onerror = () => {
      console.error('Failed to load MSAL library');
      setMsalLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [MICROSOFT_CLIENT_ID]);

  /**
   * Handles Microsoft authentication response
   * Exchanges the Microsoft access token for a JWT from our backend
   */
  const handleMicrosoftResponse = useCallback(async (accessToken) => {
    try {
      setIsLoading(true);
      if (onLoading) onLoading(true);

      // Send access token to backend for verification
      const response = await api.post('/auth/oauth2/microsoft', {
        accessToken: accessToken
      });

      // Login with the JWT token from our backend
      login(response.data.token, response.data.user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Microsoft OAuth2 authentication failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to authenticate with Microsoft';
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
      if (onLoading) onLoading(false);
    }
  }, [login, navigate, onError, onLoading]);

  /**
   * Initiates Microsoft OAuth2 popup flow
   */
  const handleMicrosoftLogin = useCallback(async () => {
    if (!msalLoaded || !window.msal || isLoading || disabled) {
      return;
    }

    if (!MICROSOFT_CLIENT_ID) {
      console.error('Microsoft Client ID not configured');
      if (onError) onError('Microsoft authentication is not configured');
      return;
    }

    try {
      setIsLoading(true);
      if (onLoading) onLoading(true);

      // Initialize MSAL application
      const msalConfig = {
        auth: {
          clientId: MICROSOFT_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
          redirectUri: REDIRECT_URI,
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: false,
        }
      };

      const msalInstance = new window.msal.PublicClientApplication(msalConfig);
      await msalInstance.initialize();

      // Login request configuration
      const loginRequest = {
        scopes: ['openid', 'profile', 'email', 'User.Read'],
        prompt: 'select_account'
      };

      // Initiate popup login
      const response = await msalInstance.loginPopup(loginRequest);
      
      if (response && response.accessToken) {
        // Exchange Microsoft token for our JWT
        await handleMicrosoftResponse(response.accessToken);
      } else {
        throw new Error('No access token received from Microsoft');
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      
      // Handle specific MSAL errors
      if (error.errorCode === 'user_cancelled') {
        if (onError) onError('Microsoft login was cancelled');
      } else if (error.errorCode === 'popup_window_error') {
        if (onError) onError('Popup was blocked. Please allow popups for this site.');
      } else {
        const errorMessage = error.message || 'Failed to sign in with Microsoft';
        if (onError) onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      if (onLoading) onLoading(false);
    }
  }, [msalLoaded, isLoading, disabled, MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID, REDIRECT_URI, handleMicrosoftResponse, onError, onLoading]);

  // Don't render if Microsoft OAuth is not configured
  if (!MICROSOFT_CLIENT_ID) {
    return null;
  }

  return (
    <button
      onClick={handleMicrosoftLogin}
      disabled={disabled || isLoading || !msalLoaded}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
          <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          <span className="text-gray-700 font-medium">Sign in with Microsoft</span>
        </>
      )}
    </button>
  );
};

export default MicrosoftLoginButton;
