import adminApiClient from '@/lib/api/client';
import { Organization, OrganizationStats, ApiResponse } from '@/types';

export const organizationsApi = {
  list: async (params?: { page?: number; search?: string; plan?: string; is_active?: boolean }) => {
    const res = await adminApiClient.get<ApiResponse<Organization[]>>('/organizations', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await adminApiClient.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Organization>) => {
    const res = await adminApiClient.post<ApiResponse<Organization>>('/organizations', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Organization>) => {
    const res = await adminApiClient.put<ApiResponse<Organization>>(`/organizations/${id}`, data);
    return res.data.data;
  },

  toggleStatus: async (id: number) => {
    const res = await adminApiClient.post<ApiResponse<Organization>>(`/organizations/${id}/toggle-status`);
    return res.data.data;
  },

  getStats: async (id: number) => {
    const res = await adminApiClient.get<ApiResponse<OrganizationStats>>(`/organizations/${id}/statistics`);
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await adminApiClient.delete(`/organizations/${id}`);
    return res.data;
  },
};
