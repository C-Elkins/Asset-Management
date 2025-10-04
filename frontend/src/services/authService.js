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
  } catch {
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
  } catch {
    return null;
  }
}

export const authService = {
  async login(username, password) {
    console.log('[AuthService] Starting login attempt for:', username);
    try {
      // Backend expects 'email' field, but form uses 'username' input
      const { data } = await api.post('/auth/login', { email: username, password });
      
      const { accessToken, refreshToken, user, expiresIn, token } = data;
      const finalAccess = accessToken || token; // fallback to legacy field
      if (!finalAccess) {
        console.error('[AuthService] No access token in response');
        return { success: false, error: 'No access token returned' };
      }
      
      return {
        success: true,
        accessToken: finalAccess,
        refreshToken: refreshToken || null,
        user: user || inferUserFromToken(finalAccess),
        expiresIn: expiresIn || 0
      };
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      const network = error.code === 'ERR_NETWORK' || !error.response;
      // E2E/CI fallback: if backend is unreachable and demo creds are used, synthesize a valid login
      // Demo credential fallback removed for production
      if (network) {
        return { success: false, error: 'Cannot reach backend. Ensure backend is running.' };
      }
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 401) return { success: false, error: message || 'Invalid email or password.' };
      if (status >= 500) return { success: false, error: 'Server error. Try again.' };
      return { success: false, error: message || 'Login failed.' };
    }
  },

  async register({ username, email, password }) {
    try {
      await api.post('/auth/register', { username, email, password });
      return true;
    } catch (e) {
      throw new Error(e?.response?.data?.message || 'Registration failed');
    }
  },

  async forgotPassword(email) {
    try {
      await api.post('/auth/forgot-password', { email });
      return true;
    } catch {
      // fallback: always succeed for security (do not reveal accounts)
      return true;
    }
  },

  async resetPassword({ token, newPassword }) {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return true;
    } catch (e) {
      throw new Error(e?.response?.data?.message || 'Reset failed');
    }
  },

  async enrollTotp() {
    try {
      const { data } = await api.post('/auth/mfa/totp/enroll');
      return data; // { secret, qrCodeDataUri }
    } catch (e) {
      throw new Error(e?.response?.data?.message || 'Failed to start TOTP enrollment');
    }
  },

  async verifyTotp({ code }) {
    try {
      await api.post('/auth/mfa/totp/verify', { code });
      return true;
    } catch (e) {
      throw new Error(e?.response?.data?.message || 'Invalid code');
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
    } catch {
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

  async changePassword({ username, newPassword }) {
    // Assumes backend exposes /users/{username}/change-password or similar endpoint
    try {
      // You may need to adjust endpoint and payload to match backend
      await api.post(`/users/${encodeURIComponent(username)}/change-password`, { newPassword });
      return true;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to change password');
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
