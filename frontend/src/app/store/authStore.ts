import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../shared/types';
import { authService } from '../../services/authService.js';

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
        set({ isLoading: true, error: null });
        const result = await authService.login(credentials.username, credentials.password);
        if (!result.success) {
            set({ isLoading: false, error: result.error || 'Login failed' });
            throw new Error(result.error || 'Login failed');
        }
        const expiresAt = result.expiresIn ? Date.now() + result.expiresIn * 1000 : null;
        set({
          user: result.user || null,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        get().scheduleRefresh();
      },

      logout: async () => {
        const { refreshToken, refreshTimerId } = get();
        if (refreshTimerId) clearTimeout(refreshTimerId);
        if (refreshToken) await authService.logout(refreshToken);
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
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        const result = await authService.refresh(refreshToken);
        if (!result.success) {
          await get().logout();
          return false;
        }
        const expiresAt = result.expiresIn ? Date.now() + result.expiresIn * 1000 : null;
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
        const { accessToken, user, expiresAt } = get();
        if (accessToken && user) {
          // Validate expiration
          if (expiresAt && Date.now() > expiresAt) {
            await get().refreshAuth();
            return;
          }
          // Optionally fetch fresh profile
          const me = await authService.me(accessToken);
          if (me.success && me.user) set({ user: me.user });
          get().scheduleRefresh();
          return;
        }
        // Attempt silent refresh if we only have refresh token persisted
        const stored = get().refreshToken;
        if (stored) await get().refreshAuth();
      },

      scheduleRefresh: () => {
        const { expiresAt, refreshTimerId } = get();
        if (!expiresAt) return;
        if (refreshTimerId) clearTimeout(refreshTimerId);
        const now = Date.now();
        const skew = 30_000; // refresh 30s before expiry
        const delay = Math.max(1000, expiresAt - now - skew);
        const id = window.setTimeout(() => {
          get().refreshAuth();
        }, delay);
        set({ refreshTimerId: id });
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
