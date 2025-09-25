import { api } from './api.js';

// TODO: When backend moves refresh token to HttpOnly cookie, remove storing refresh token client-side.

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
      const { data } = await api.post('/auth/login', { username, password });
      const { accessToken, refreshToken, user, expiresIn, token } = data;
      const finalAccess = accessToken || token; // fallback to legacy field
      if (!finalAccess) return { success: false, error: 'No access token returned' };
      return {
        success: true,
        accessToken: finalAccess,
        refreshToken: refreshToken || null,
        user: user || inferUserFromToken(finalAccess),
        expiresIn: expiresIn || 0
      };
    } catch (error) {
      const network = error.code === 'ERR_NETWORK' || !error.response;
      if (network) {
        return { success: false, error: 'Cannot reach backend. Ensure backend is running.' };
      }
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 401) return { success: false, error: message || 'Invalid username or password.' };
      if (status >= 500) return { success: false, error: 'Server error. Try again.' };
      return { success: false, error: message || 'Login failed.' };
    }
  },

  async refresh(refreshToken) {
    if (!refreshToken) return { success: false, error: 'Missing refresh token' };
    try {
      const { data } = await api.post('/auth/refresh', null, {
        headers: { 'X-Refresh-Token': refreshToken }
      });
      const { accessToken, refreshToken: newRefresh, user, expiresIn, token } = data;
      const finalAccess = accessToken || token;
      if (!finalAccess) return { success: false, error: 'No access token on refresh' };
      return {
        success: true,
        accessToken: finalAccess,
        refreshToken: newRefresh || refreshToken,
        user: user || inferUserFromToken(finalAccess),
        expiresIn: expiresIn || 0
      };
    } catch (error) {
      return { success: false, error: 'Refresh failed' };
    }
  },

  async me(accessToken) {
    try {
      const { data } = await api.get('/auth/me', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      });
      return { success: true, user: data };
    } catch {
      return { success: false };
    }
  },

  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', null, { headers: { 'X-Refresh-Token': refreshToken } });
      }
    } catch {
      // Swallow logout errors
    }
  }
};

function inferUserFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;
  return {
    id: payload.sub || 'unknown',
    username: payload.sub || payload.username || 'unknown',
    email: payload.email || '',
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    role: payload.roles ? (Array.isArray(payload.roles) ? payload.roles[0] : payload.roles.split(',')[0]) : 'USER',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
