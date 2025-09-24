import { api } from './api.js';

function base64UrlDecode(str) {
  try {
    // Replace URL-safe chars and pad
    const pad = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    try {
      // Decode UTF-8
      return decodeURIComponent(
        decoded.split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return decoded;
    }
  } catch (e) {
    return null;
  }
}

function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = base64UrlDecode(parts[1]);
  if (!payload) return null;
  try {
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      
      const { token } = response.data;
      if (token) {
        localStorage.setItem('jwt_token', token);
        return {
          success: true,
          token,
          user: { username }
        };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const message = error.response?.data?.message;
        
        if (status === 401) {
          return { 
            success: false, 
            error: message || 'Invalid username or password. Please check your credentials and try again.' 
          };
        } else if (status >= 500) {
          return { 
            success: false, 
            error: 'Server error. Please try again later.' 
          };
        } else {
          return { 
            success: false, 
            error: message || 'Login failed. Please try again.' 
          };
        }
      } else if (error.request) {
        return { 
          success: false, 
          error: 'Unable to connect to server. Please check your connection and try again.' 
        };
      } else {
        return { 
          success: false, 
          error: 'Login failed. Please try again.' 
        };
      }
    }
  },

  async logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('jwt_token');
  },

  getToken() {
    return localStorage.getItem('jwt_token');
  },

  getUser() {
    const token = localStorage.getItem('jwt_token');
    const payload = decodeJwt(token);
    if (!payload) return null;
    // Try common claim names
    const username = payload.username || payload.sub || payload.user_name || null;
    const roles = payload.roles || payload.authorities || payload.scopes || payload.scope || [];
    const rolesArr = Array.isArray(roles)
      ? roles
      : typeof roles === 'string'
        ? roles.split(' ') // space-separated scopes
        : [];
    return { username, roles: rolesArr, payload };
  }
};
