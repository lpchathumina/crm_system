import adminApiClient from '@/lib/api/client';
import { Role, Permission, ApiResponse } from '@/types';

export const rolesApi = {
  listRoles: async () => {
    const res = await adminApiClient.get<ApiResponse<Role[]>>('/roles');
    return res.data.data;
  },

  listPermissions: async () => {
    const res = await adminApiClient.get<ApiResponse<Permission[]>>('/permissions');
    return res.data.data;
  },

  createRole: async (data: { name: string; permissions: string[] }) => {
    const res = await adminApiClient.post<ApiResponse<Role>>('/roles', data);
    return res.data.data;
  },

  updateRole: async (id: number, data: { name: string; permissions: string[] }) => {
    const res = await adminApiClient.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return res.data.data;
  },

  deleteRole: async (id: number) => {
    const res = await adminApiClient.delete(`/roles/${id}`);
    return res.data;
  },
};
