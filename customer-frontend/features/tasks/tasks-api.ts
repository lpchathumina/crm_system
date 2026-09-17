import customerApiClient from '@/lib/api/client';
import { Task, ApiResponse } from '@/types';

export const tasksApi = {
  list: async (params?: { page?: number; status?: string; priority?: string; customer_id?: number }) => {
    const res = await customerApiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await customerApiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Task>) => {
    const res = await customerApiClient.post<ApiResponse<Task>>('/tasks', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Task>) => {
    const res = await customerApiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data;
  },

  toggleComplete: async (id: number) => {
    const res = await customerApiClient.put<ApiResponse<Task>>(`/tasks/${id}/toggle`);
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await customerApiClient.delete(`/tasks/${id}`);
    return res.data;
  },
};
