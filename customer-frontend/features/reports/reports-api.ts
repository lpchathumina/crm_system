import customerApiClient from '@/lib/api/client';
import { ApiResponse } from '@/types';

export const reportsApi = {
  sales: async () => {
    const res = await customerApiClient.get<ApiResponse<any>>('/reports/sales');
    return res.data.data;
  },

  leads: async () => {
    const res = await customerApiClient.get<ApiResponse<any>>('/reports/leads');
    return res.data.data;
  },

  activities: async () => {
    const res = await customerApiClient.get<ApiResponse<any>>('/reports/activities');
    return res.data.data;
  },
};
