import axios from 'axios';
import { useAuthStore } from '../app/store/authStore';
import { v4 as uuidv4 } from 'uuid';
import { useRateLimitStore } from '../store/rateLimitStore';
// authDebug removed

// Derive base URL. Prefer explicit env, then proxy path in dev, else absolute.
const EXPLICIT = import.meta.env.VITE_API_BASE_URL;
// Use proxy path for development to avoid CORS issues
const BASE_URL = EXPLICIT || '/api';

// Create axios instance with backend configuration
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Correlation ID (persist for session lifespan)
const CORR_KEY = 'corr_id';
let corrId = sessionStorage.getItem(CORR_KEY);
if (!corrId) {
  corrId = uuidv4();
  sessionStorage.setItem(CORR_KEY, corrId);
}

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Correlation-Id'] = corrId;
    try {
      const tenant = localStorage.getItem('tenant_id');
      if (tenant) config.headers['X-Tenant-Id'] = tenant;
    } catch {}
  // authDebug removed
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    // Capture rate limit headers if present
    try {
      const headers = response.headers || {};
      if (headers['x-ratelimit-limit'] || headers['x-ratelimit-remaining']) {
        useRateLimitStore.getState().setFromHeaders(headers);
      }
    } catch {/* noop */}
    return response;
  },
  async (error) => {
    // Also capture rate limit headers on error
    try {
      const headers = error?.response?.headers || {};
      if (headers['x-ratelimit-limit'] || headers['x-ratelimit-remaining']) {
        useRateLimitStore.getState().setFromHeaders(headers);
      }
    } catch {/* noop */}
    
    const status = error.response?.status;
    if (status === 401) {
      const original = error.config || {};
      const reqUrl = original.url || '';
      const isAuthEndpoint = reqUrl.startsWith('/auth') || reqUrl.includes('/auth/');
      const isHealthEndpoint = reqUrl.includes('/actuator/health');
      const onLoginRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');
      
      // For auth endpoints (login/refresh/me), do not trigger global logout or redirects.
      // Let the caller handle the 401 to show inline validation messages.
      if (isAuthEndpoint || isHealthEndpoint || onLoginRoute) {
        if (import.meta && import.meta.env && import.meta.env.MODE === 'development') {
          console.debug('[API 401] Skipping global handling', { isAuthEndpoint, isHealthEndpoint, onLoginRoute, url: reqUrl });
        }
        return Promise.reject(error);
      }
      
  const { refreshToken, lastLoginTime } = useAuthStore.getState();
  const recentLogin = lastLoginTime && (Date.now() - lastLoginTime) < 5_000; // 5s guard
      // Only attempt a refresh if we actually have a refresh token
      if (refreshToken && !original._retry) {
          if (import.meta && import.meta.env && import.meta.env.MODE === 'development') console.log('🔄 [API Interceptor] Attempting token refresh for failed request:', reqUrl);
        original._retry = true;
        // small jittered backoff to avoid racing right after login
        if (recentLogin) {
          await new Promise(res => setTimeout(res, 300));
        }
        try {
          const ok = await useAuthStore.getState().refreshAuth();
          if (ok) {
              if (import.meta && import.meta.env && import.meta.env.MODE === 'development') console.log('✅ [API Interceptor] Token refresh successful, retrying request');
            const { accessToken } = useAuthStore.getState();
            if (accessToken) {
              original.headers = { ...(original.headers || {}), Authorization: `Bearer ${accessToken}` };
            }
            return await axios.request(original);
            } else {
              if (import.meta && import.meta.env && import.meta.env.MODE === 'development') console.error('❌ [API Interceptor] Token refresh returned false');
          }
        } catch {
            if (import.meta && import.meta.env && import.meta.env.MODE === 'development') console.error('❌ [API Interceptor] Token refresh threw error');
          // fall through to logout
        }
      }
      
      // If we had a refresh token and refresh failed, log out
      if (refreshToken) {
        if (import.meta && import.meta.env && import.meta.env.MODE === 'development') {
          console.error('🚨 [API Interceptor] Refresh failed, logging out automatically!', { 
           url: reqUrl, 
           status: error.response?.status,
           hasRefreshToken: !!refreshToken 
          });
        }
        try { localStorage.setItem('logout_reason', 'Your session ended. Please sign in again.'); } catch {}
        await useAuthStore.getState().logout();
      }
      
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);
