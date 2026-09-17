import customerApiClient from '@/lib/api/client';
import { ApiResponse } from '@/types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await customerApiClient.post('/auth/login', credentials);
    return res.data;
  },

  logout: async () => {
    const res = await customerApiClient.post('/auth/logout');
    return res.data;
  },

  me: async () => {
    const res = await customerApiClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { name: string; phone?: string }) => {
    const res = await customerApiClient.put('/auth/profile', data);
    return res.data;
  },

  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await customerApiClient.put('/auth/password', data);
    return res.data;
  },
};
