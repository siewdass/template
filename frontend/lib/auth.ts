import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Fetch } from './api';
import { showToast } from './toast';
import { useNavigationStore } from './navigation';

interface AuthConfig  {
  endpoint: string;
  redirect: {
    onlogin: string;
    onlogout: string;
  }
}

interface AuthState {
  user: any;
  logged: boolean;
  loading: boolean;
  config: AuthConfig
  setConfig: (config: AuthConfig) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      logged: false,
      loading: false,
      config: {
        endpoint: '',
        redirect: {
          onlogin: '',
          onlogout: ''
        }
      },

      setConfig: (config: AuthConfig) => set({ config }),

      login: async ({ email, password }) => {
        set({ loading: true });
        
        try {
          const res = await Fetch({
            method: 'POST',
            endpoint: useAuth.getState().config.endpoint,
            params: { email, password }
          });
          if (res.message) {
            showToast({title: 'Authorization', message: res.message, error: res.error})
          }
          if (!res.error) {
            useNavigationStore.getState().navigate(
              useAuth.getState().config.redirect.onlogin
            );
            set({ user: res.data.user, logged: true, loading: false });
            if (res.token) localStorage.setItem('token', res.data.token);
          }
        } catch {
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, logged: false, loading: false });
        useNavigationStore.getState().navigate(
          useAuth.getState().config.redirect.onlogout
        );
      }
    }),
    
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, logged: state.logged, loading: state.loading }),
      version: 1,
    }
  )
);