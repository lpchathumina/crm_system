import customerApiClient from '@/lib/api/client';
import { Lead, ApiResponse } from '@/types';

export const leadsApi = {
  list: async (params?: { page?: number; search?: string; status?: string; source?: string }) => {
    const res = await customerApiClient.get<ApiResponse<Lead[]>>('/leads', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await customerApiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Lead> & { first_name?: string; last_name?: string; company_name?: string; phone?: string; email?: string; notes?: string }) => {
    const res = await customerApiClient.post<ApiResponse<Lead>>('/leads', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Lead>) => {
    const res = await customerApiClient.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data.data;
  },

  convert: async (
    id: number,
    data: {
      create_deal?: boolean;
      deal_name?: string;
      deal_amount?: number | null;
      deal_close_date?: string | null;
    }
  ) => {
    const res = await customerApiClient.post<ApiResponse<any>>(`/leads/${id}/convert`, data);
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await customerApiClient.delete(`/leads/${id}`);
    return res.data;
  },
};
