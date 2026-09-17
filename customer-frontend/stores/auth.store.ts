import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CrmUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  roles: string[];
  organization: {
    id: number;
    name: string;
    plan: string;
  };
}

interface AuthState {
  token: string | null;
  user: CrmUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: CrmUser) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const useCrmAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: CrmUser) => {
        set({ token, user, isAuthenticated: true });
        localStorage.setItem('crm_token', token);
        localStorage.setItem('crm_user', JSON.stringify(user));
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
      },

      hasRole: (role: string) => {
        const user = get().user;
        if (!user) return false;
        return user.roles.includes(role);
      },
    }),
    {
      name: 'crm-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
