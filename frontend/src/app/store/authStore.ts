import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../shared/types';
import { authService } from '../../services/authService.js';
// authDebug removed

// Dev-mode flag safe for TS without relying on vite/client types
const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.MODE === 'development';

interface TokenMeta {
  expiresAt: number | null; // epoch ms
  refreshTimerId?: number | null;
}

interface AuthState extends TokenMeta {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginTime: number | null; // Track when user last logged in
}

type AuthResult = {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User | null;
  expiresIn?: number;
  error?: string;
};

interface AuthActions {
  login: (credentials: { username: string; password: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  initSession: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  scheduleRefresh: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  refreshTimerId: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLoginTime: null,

      // Actions
      login: async (credentials) => {
        if (isDev) console.log('[AuthStore] Login initiated with credentials:', credentials);
  // authDebug removed
        set({ isLoading: true, error: null });
        
        try {
          if (isDev) console.log('[AuthStore] Calling authService.login');
          const result = await authService.login(credentials.username, credentials.password);
          if (isDev) console.log('[AuthStore] AuthService login result:', { success: result.success, hasUser: !!result.user, hasToken: !!result.accessToken });
          // authDebug removed
          
          if (!result.success) {
            if (isDev) console.error('[AuthStore] Login failed:', result.error);
            set({ isLoading: false, error: result.error || 'Login failed' });
            // authDebug removed
            throw new Error(result.error || 'Login failed');
          }
          
          const expiresAt = result.expiresIn ? Date.now() + result.expiresIn * 1000 : null;
          if (isDev) console.log('[AuthStore] Setting tokens and user data, expiresAt:', expiresAt);
          // authDebug removed
          
          // Mirror token into localStorage for axios interceptor compatibility
          if (result.accessToken) {
            localStorage.setItem('jwt_token', result.accessToken);
            if (isDev) console.log('[AuthStore] Token saved to localStorage');
            // authDebug removed
          }
          
          set({
            user: result.user || null,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastLoginTime: Date.now(),
          });
          
          if (isDev) console.log('[AuthStore] Auth state updated successfully');
          // authDebug removed
          get().scheduleRefresh();
          // authDebug removed
          return result; // Return the result to resolve the promise
        } catch (error: unknown) {
          if (isDev) console.error('[AuthStore] Login error caught:', error);
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: message });
          // authDebug removed
          throw error;
        }
      },

      logout: async () => {
  // authDebug removed
        const { refreshToken, refreshTimerId } = get();
        if (refreshTimerId) clearTimeout(refreshTimerId);
        if (refreshToken) await authService.logout(refreshToken);
        localStorage.removeItem('jwt_token');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          refreshTimerId: null,
          isAuthenticated: false,
          error: null,
          lastLoginTime: null,
        });
        localStorage.removeItem('auth-store');
  // authDebug removed
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          if (isDev) console.log('❌ [AuthStore] No refresh token available');
          return false;
        }
        
        if (isDev) console.log('🔄 [AuthStore] Attempting token refresh');
        const result = await authService.refresh(refreshToken);
        if (!result.success) {
          if (isDev) console.log('❌ [AuthStore] Refresh failed, logging out');
          try { localStorage.setItem('logout_reason', 'Your session expired. Please sign in again.'); } catch {}
          await get().logout();
          return false;
        }
        
        if (isDev) console.log('✅ [AuthStore] Refresh successful');
        const expiresAt = result.expiresIn ? Date.now() + result.expiresIn * 1000 : null;
        if (result.accessToken) localStorage.setItem('jwt_token', result.accessToken);
        set({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user || get().user,
          expiresAt,
          isAuthenticated: true,
        });
        get().scheduleRefresh();
        return true;
      },

      initSession: async () => {
        if (isDev) console.log('🚀 [AuthStore] initSession called');
        const { accessToken, user, expiresAt, refreshToken, lastLoginTime } = get();
        if (isDev) console.log('📊 [AuthStore] initSession state:', { 
          hasAccessToken: !!accessToken, 
          hasUser: !!user, 
          expiresAt, 
          hasRefreshToken: !!refreshToken, 
          lastLoginTime,
          currentTime: Date.now() 
        });
        
        // If user just logged in (within last 10 seconds), don't try to refresh
        const recentLogin = lastLoginTime && (Date.now() - lastLoginTime) < 10_000;
        if (recentLogin) {
          if (isDev) console.log('🕐 [AuthStore] Recent login detected, skipping auto-refresh');
          set({ isAuthenticated: true });
          get().scheduleRefresh();
          return;
        }
        
        // If we have both token and user, check if expired
        if (accessToken && user) {
          if (isDev) console.log('🔍 [AuthStore] Have token and user, checking expiration');
          if (expiresAt && Date.now() > expiresAt) {
            if (isDev) console.log('⏰ [AuthStore] Token expired, checking for refresh token');
            // Token expired, try refresh
            if (refreshToken) {
              if (isDev) console.log('🔄 [AuthStore] Token expired, attempting refresh');
              await get().refreshAuth();
              return;
            } else {
              // No refresh token, clear session
              if (isDev) console.log('❌ [AuthStore] No refresh token, clearing session (AUTO LOGOUT!)');
              await get().logout();
              return;
            }
          }
          
          // Token still valid, set authenticated state and schedule refresh
          if (isDev) console.log('✅ [AuthStore] Token still valid, setting authenticated');
          set({ isAuthenticated: true });
          get().scheduleRefresh();
          return;
        }
        
        // No stored user/token, try refresh if we have refresh token (but not immediately after login failure)
        if (refreshToken && !recentLogin) {
          if (isDev) console.log('🔄 [AuthStore] No access token but have refresh token, attempting refresh');
          await get().refreshAuth();
        } else {
          if (isDev) console.log('⏭️ [AuthStore] No tokens or recent login, skipping refresh');
        }
      },

      scheduleRefresh: () => {
        const { expiresAt, refreshTimerId } = get();
        if (!expiresAt) return;
        if (refreshTimerId) clearTimeout(refreshTimerId);
        const now = Date.now();
        const skew = 30_000; // refresh 30s before expiry
        const delay = Math.max(1000, expiresAt - now - skew);
        const id = window.setTimeout(() => {
          // authDebug removed
          get().refreshAuth();
        }, delay);
        set({ refreshTimerId: id });
  // authDebug removed
      },

      setUser: (user) => { set({ user }); },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => { set({ isLoading: loading }); },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        expiresAt: state.expiresAt,
        lastLoginTime: state.lastLoginTime,
      }),
    }
  )
);

export { useAuthStore };
