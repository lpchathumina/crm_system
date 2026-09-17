import customerApiClient from '@/lib/api/client';
import { Customer, ApiResponse } from '@/types';

export const customersApi = {
  list: async (params?: { page?: number; search?: string; status?: string; type?: string }) => {
    const res = await customerApiClient.get<ApiResponse<Customer[]>>('/customers', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await customerApiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Customer>) => {
    const res = await customerApiClient.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Customer>) => {
    const res = await customerApiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await customerApiClient.delete(`/customers/${id}`);
    return res.data;
  },
};
