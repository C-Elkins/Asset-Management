import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
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
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock authentication - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
          
          const validCredentials = [
            { username: 'admin', password: 'admin123', role: 'SUPER_ADMIN' },
            { username: 'manager', password: 'manager123', role: 'MANAGER' },
            { username: 'user', password: 'user123', role: 'USER' }
          ];

          const validUser = validCredentials.find(
            cred => cred.username === credentials.username && cred.password === credentials.password
          );

          if (!validUser) {
            throw new Error('Invalid username or password');
          }

          const mockUser: User = {
            id: '1',
            username: validUser.username,
            email: `${validUser.username}@company.com`,
            firstName: validUser.username.charAt(0).toUpperCase() + validUser.username.slice(1),
            lastName: 'User',
            role: validUser.role as any,
            department: 'IT',
            jobTitle: validUser.role === 'SUPER_ADMIN' ? 'System Administrator' : validUser.role === 'MANAGER' ? 'IT Manager' : 'IT Specialist',
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const mockToken = 'mock-jwt-token-' + Math.random().toString(36);
          
          set({
            user: mockUser,
            token: mockToken,
            refreshToken: 'mock-refresh-token-' + Math.random().toString(36),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear persisted state
        localStorage.removeItem('auth-store');
      },

      refreshAuth: async () => {
        // Mock refresh - in real app this would validate/refresh tokens
        const { refreshToken } = get();
        
        if (!refreshToken) {
          get().logout();
          return;
        }

        // For now, just keep the current state
      },

      setUser: (user) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
