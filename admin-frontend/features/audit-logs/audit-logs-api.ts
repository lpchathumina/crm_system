import adminApiClient from '@/lib/api/client';
import { AuditLog, ApiResponse } from '@/types';

export const auditLogsApi = {
  list: async (params?: { page?: number; action?: string; model_type?: string; search?: string }) => {
    const res = await adminApiClient.get<ApiResponse<AuditLog[]>>('/audit-logs', { params });
    return res.data;
  },
};
