'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Loader2,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
  last_login_at: string | null;
  created_at: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    is_active: true,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('per_page', '10');
      if (search) params.set('search', search);
      const res = await adminApiClient.get(`/v1/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  const users: AdminUser[] = data?.data || [];
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0 };

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      await adminApiClient.post('/v1/admin/users', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<typeof formData> }) => {
      await adminApiClient.put(`/v1/admin/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!confirm('Are you sure you want to delete this administrator?')) return;
      await adminApiClient.delete(`/v1/admin/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      is_active: true,
    });
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.roles[0] || 'admin',
      is_active: user.is_active,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            Admin Users
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            System administrators with privileged access to the CRM platform.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Administrator</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search administrators by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Admin User</th>
                <th className="py-3.5 px-4">Assigned Roles</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading administrators...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No administrator accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.length ? (
                          u.roles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20"
                            >
                              <Shield className="w-2.5 h-2.5" /> {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No role assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never logged in'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(u)}
                        title="Edit user"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(u.id)}
                        title="Delete user"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
            <div>
              Showing page <span className="text-slate-200 font-semibold">{meta.current_page}</span> of{' '}
              <span className="text-slate-200 font-semibold">{meta.last_page}</span> ({meta.total} total)
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create / Edit User */}
      {(isCreateOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editingUser ? 'Edit Administrator' : 'Create Administrator'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingUser) {
                  updateMutation.mutate({ id: editingUser.id, payload: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. John Administrator"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="admin@crm.example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="super-admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
