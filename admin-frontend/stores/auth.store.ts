import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  last_login_at: string | null;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAdminAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: AdminUser) => {
        set({ token, user, isAuthenticated: true });
        // Also set in localStorage for the axios interceptor
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        if (user.roles.includes('super-admin')) return true;
        return user.permissions.includes(permission);
      },

      hasRole: (role: string) => {
        const user = get().user;
        if (!user) return false;
        return user.roles.includes(role);
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
