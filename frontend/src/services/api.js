import axios from 'axios';
import { useAuthStore } from '../app/store/authStore';
import { v4 as uuidv4 } from 'uuid';
import { useRateLimitStore } from '../store/rateLimitStore';

// Derive base URL. Prefer explicit env, then proxy path in dev, else absolute.
const EXPLICIT = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = EXPLICIT || (import.meta.env.DEV ? '/api' : 'http://localhost:8080/api/v1');

// Helper to detect likely proxy failure (e.g., 404 on /auth/login with relative path)
const isNetworkOrProxyIssue = (error) => {
  if (!error) return false;
  if (error.code === 'ERR_NETWORK') return true;
  if (error.response?.status === 404) return true;
  return false;
};

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
    // Also capture on error (e.g., 429)
    try {
      const headers = error?.response?.headers || {};
      if (headers['x-ratelimit-limit'] || headers['x-ratelimit-remaining']) {
        useRateLimitStore.getState().setFromHeaders(headers);
      }
    } catch {/* noop */}
    // Optionally attempt a single retry with absolute URL if proxy-relative failed
    if (isNetworkOrProxyIssue(error) && !error.config?._retried) {
      const original = { ...error.config, _retried: true };
      // Force absolute base
      original.baseURL = 'http://localhost:8080/api/v1';
      try {
        return await axios.request(original);
      } catch (e) {
        // fall through to normal handling
        error = e;
      }
    }
    const status = error.response?.status;
    if (status === 401) {
      const original = error.config;
      const reqUrl = original?.url || '';
      const isAuthEndpoint = reqUrl.startsWith('/auth') || reqUrl.includes('/auth/');
      if (!isAuthEndpoint && !original._retry) {
        original._retry = true;
        try {
          const ok = await useAuthStore.getState().refreshAuth();
          if (ok) {
            const { accessToken } = useAuthStore.getState();
            if (accessToken) {
              original.headers = { ...(original.headers || {}), Authorization: `Bearer ${accessToken}` };
            }
            return await axios.request(original);
          }
        } catch {
          // fall through
        }
      }
      // If still unauthorized, force logout
      await useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return; 
    }
    return Promise.reject(error);
  }
);
