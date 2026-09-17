import adminApiClient from '@/lib/api/client';
import { AdminUser, ApiResponse } from '@/types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await adminApiClient.post<ApiResponse<{ token: string; user: AdminUser }>>(
      '/auth/login',
      credentials
    );
    return res.data.data;
  },

  logout: async () => {
    const res = await adminApiClient.post('/auth/logout');
    return res.data;
  },

  me: async () => {
    const res = await adminApiClient.get<ApiResponse<AdminUser>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data: { name: string }) => {
    const res = await adminApiClient.put<ApiResponse<AdminUser>>('/auth/profile', data);
    return res.data.data;
  },

  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await adminApiClient.post('/auth/change-password', data);
    return res.data;
  },
};
