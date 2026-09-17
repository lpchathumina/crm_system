import adminApiClient from '@/lib/api/client';
import { AdminUser, ApiResponse, PaginationMeta } from '@/types';

export const usersApi = {
  list: async (params?: { page?: number; search?: string; role?: string }) => {
    const res = await adminApiClient.get<ApiResponse<AdminUser[]>>('/users', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await adminApiClient.get<ApiResponse<AdminUser>>(`/users/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<AdminUser> & { password?: string; role?: string }) => {
    const res = await adminApiClient.post<ApiResponse<AdminUser>>('/users', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<AdminUser> & { password?: string; role?: string }) => {
    const res = await adminApiClient.put<ApiResponse<AdminUser>>(`/users/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await adminApiClient.delete(`/users/${id}`);
    return res.data;
  },
};
