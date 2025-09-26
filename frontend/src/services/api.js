import axios from 'axios';
import { useAuthStore } from '../app/store/authStore';
import { v4 as uuidv4 } from 'uuid';
import { useRateLimitStore } from '../store/rateLimitStore';
// authDebug removed

// Derive base URL. Prefer explicit env, then proxy path in dev, else absolute.
const EXPLICIT = import.meta.env.VITE_API_BASE_URL;
// Fix: Use correct backend API path consistently
const BASE_URL = EXPLICIT || 'http://localhost:8080/api/v1';

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
    try {
      // Mark session stabilized after first successful protected API call (not auth/health)
      const url = response.config?.url || '';
      const isAuthEndpoint = url.startsWith('/auth') || url.includes('/auth/');
      const isHealthEndpoint = url.includes('/actuator/health');
      if (!isAuthEndpoint && !isHealthEndpoint && response.status >= 200 && response.status < 300) {
        sessionStorage.setItem('AUTH_STABILIZED', '1');
  // authDebug removed
      }
    } catch { /* noop */ }
  // authDebug removed
    return response;
  },
  async (error) => {
    // Also capture on error (e.g., 429)
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
      // Immediate post-login grace: if within 5s after login, don't force logout or retries; let caller/guard handle
      let inPostLoginGrace = false;
      try {
        const ts = Number(sessionStorage.getItem('JUST_LOGGED_IN') || 0);
        inPostLoginGrace = !!ts && (Date.now() - ts < 5000);
      } catch { /* noop */ }
      // Extra stabilization: until one successful protected call, defer global handling up to 10s
      let inStabilization = false;
      try {
        const stabilized = sessionStorage.getItem('AUTH_STABILIZED') === '1';
        const ts = Number(sessionStorage.getItem('JUST_LOGGED_IN') || 0);
        const within10s = !!ts && (Date.now() - ts < 10000);
        inStabilization = !stabilized && within10s;
      } catch { /* noop */ }
      // For auth endpoints (login/refresh/me), do not trigger global logout or redirects here.
      // Let the caller handle the 401 to show inline validation messages.
      if (isAuthEndpoint) {
  // authDebug removed
        return Promise.reject(error);
      }
      // Avoid forcing redirects on health checks or while on the login route to prevent reload loops
      if (isHealthEndpoint || onLoginRoute || inPostLoginGrace || inStabilization) {
        if (import.meta && import.meta.env && import.meta.env.MODE === 'development') {
          // Debug: Show why we skipped global 401 handling
          console.debug('[API 401] Skipping global handling', { isHealthEndpoint, onLoginRoute, inPostLoginGrace, inStabilization, url: reqUrl });
        }
  // authDebug removed
        return Promise.reject(error);
      }
      const { refreshToken } = useAuthStore.getState();
      // Only attempt a refresh if we actually have a refresh token
      if (!isAuthEndpoint && refreshToken && !original._retry) {
        original._retry = true;
        try {
          // authDebug removed
          const ok = await useAuthStore.getState().refreshAuth();
          if (ok) {
            const { accessToken } = useAuthStore.getState();
            if (accessToken) {
              original.headers = { ...(original.headers || {}), Authorization: `Bearer ${accessToken}` };
            }
            // authDebug removed
            return await axios.request(original);
          }
        } catch {
          // fall through
          // authDebug removed
        }
      }
      // If still unauthorized:
      // - If we had a refresh token and refresh failed, log out (unless already on /login).
      // - If we don't have a refresh token, just reject and let the caller handle (avoid bouncing the user).
      if (refreshToken) {
        // Soft logout: update auth state so ProtectedRoute navigates without full reload.
        await useAuthStore.getState().logout();
  // authDebug removed
        return Promise.reject(error);
      }
      return Promise.reject(error);
      // fallthrough handled by above branches
    }
    return Promise.reject(error);
  }
);
