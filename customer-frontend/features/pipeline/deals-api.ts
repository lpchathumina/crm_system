import customerApiClient from '@/lib/api/client';
import { Deal, ApiResponse } from '@/types';

export const dealsApi = {
  list: async (params?: { page?: number; search?: string; stage?: string; customer_id?: number }) => {
    const res = await customerApiClient.get<ApiResponse<Deal[]>>('/deals', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await customerApiClient.get<ApiResponse<Deal>>(`/deals/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Deal>) => {
    const res = await customerApiClient.post<ApiResponse<Deal>>('/deals', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Deal>) => {
    const res = await customerApiClient.put<ApiResponse<Deal>>(`/deals/${id}`, data);
    return res.data.data;
  },

  updateStage: async (id: number, stage: string) => {
    const res = await customerApiClient.put<ApiResponse<Deal>>(`/deals/${id}/stage`, { stage });
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await customerApiClient.delete(`/deals/${id}`);
    return res.data;
  },
};
