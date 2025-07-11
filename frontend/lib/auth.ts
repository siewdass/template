import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Fetch } from './api';

interface AuthState {
  user: any;
  logged: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      logged: false,
      loading: false,
      error: null,

      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        
        try {
          const { user, token } = await Fetch({
            method: 'POST',
            endpoint: '/user/signin',
            params: { email, password }
          });

          set({ 
            user, 
            logged: true, 
            loading: false,
            error: null
          });

          if (token) {
            localStorage.setItem('token', token);
          }

        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            loading: false 
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ 
          user: null, 
          logged: false,
          loading: false,
          error: null
        });
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // explicitly use localStorage
      // Persist all state properties
      partialize: (state) => ({
        user: state.user,
        logged: state.logged,
        loading: state.loading,
        error: state.error
      })
    }
  )
);