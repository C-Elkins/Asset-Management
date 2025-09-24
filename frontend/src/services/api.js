import axios from 'axios';

// Use proxy path in development, full URL in production
const BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8080/api/v1';

// Create axios instance with backend configuration
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const reqUrl = error.config?.url || '';
      const isAuthEndpoint = reqUrl.startsWith('/auth') || reqUrl.includes('/auth/');
      const isOnLoginPage = window.location.pathname.startsWith('/login');

      // Only force redirect for unauthorized responses on protected endpoints.
      // Allow /auth endpoints (like /auth/login) and the login page to handle errors inline.
      if (!isAuthEndpoint && !isOnLoginPage) {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
        return; // Stop further processing
      }
    }
    return Promise.reject(error);
  }
);
