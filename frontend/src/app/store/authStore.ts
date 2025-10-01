import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../shared/types';
import { authService } from '../../services/authService.js';
// authDebug removed

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
}

interface AuthActions {
  login: (credentials: { username: string; password: string }) => Promise<void>;
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

      // Actions
      login: async (credentials) => {
        console.log('[AuthStore] Login initiated');
  // authDebug removed
        set({ isLoading: true, error: null });
        
        try {
          console.log('[AuthStore] Calling authService.login');
          const result = await authService.login(credentials.username, credentials.password);
          console.log('[AuthStore] AuthService login result:', { success: result.success, hasUser: !!result.user, hasToken: !!result.accessToken });
          // authDebug removed
          
          if (!result.success) {
            console.error('[AuthStore] Login failed:', result.error);
            set({ isLoading: false, error: result.error || 'Login failed' });
            // authDebug removed
            throw new Error(result.error || 'Login failed');
          }
          
          const expiresAt = result.expiresIn ? Date.now() + result.expiresIn * 1000 : null;
          console.log('[AuthStore] Setting tokens and user data, expiresAt:', expiresAt);
          // authDebug removed
          
          // Mirror token into localStorage for axios interceptor compatibility
          if (result.accessToken) {
            localStorage.setItem('jwt_token', result.accessToken);
            console.log('[AuthStore] Token saved to localStorage');
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
          });
          
          console.log('[AuthStore] Auth state updated successfully');
          // authDebug removed
          get().scheduleRefresh();
          // authDebug removed
        } catch (error: unknown) {
          console.error('[AuthStore] Login error caught:', error);
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
        });
        localStorage.removeItem('auth-store');
  // authDebug removed
      },

      refreshAuth: async () => {
  // authDebug removed
        const { refreshToken } = get();
        if (!refreshToken) return false;
        const result = await authService.refresh(refreshToken);
        if (!result.success) {
          await get().logout();
          // authDebug removed
          return false;
        }
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
  // authDebug removed
        return true;
      },

      initSession: async () => {
        const { accessToken, user, expiresAt, refreshToken } = get();
        
        // If we have both token and user, check if expired
        if (accessToken && user) {
          if (expiresAt && Date.now() > expiresAt) {
            // Token expired, try refresh
            if (refreshToken) {
              await get().refreshAuth();
              return;
            } else {
              // No refresh token, clear session
              await get().logout();
              return;
            }
          }
          
          // Token still valid, set authenticated state and schedule refresh
          set({ isAuthenticated: true });
          get().scheduleRefresh();
          return;
        }
        
        // No stored user/token, try refresh if we have refresh token
        if (refreshToken) {
          await get().refreshAuth();
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
      }),
    }
  )
);

export { useAuthStore };
