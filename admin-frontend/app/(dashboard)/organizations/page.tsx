'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  BarChart3,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Organization {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  website: string | null;
  is_active: boolean;
  plan: string;
  timezone: string;
  created_at: string;
}

interface OrgStats {
  organization_id: number;
  name: string;
  plan: string;
  is_active: boolean;
  stats: {
    storage_used_mb: number;
    api_calls_this_month: number;
    last_activity_at: string;
  };
}

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [viewingStats, setViewingStats] = useState<OrgStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    website: '',
    plan: 'starter',
    timezone: 'UTC',
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-organizations', page, search, planFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('per_page', '10');
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      const res = await adminApiClient.get(`/v1/admin/organizations?${params.toString()}`);
      return res.data;
    },
  });

  const organizations: Organization[] = data?.data || [];
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0 };

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminApiClient.put(`/v1/admin/organizations/${id}/toggle-status`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-organizations'] }),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      await adminApiClient.post('/v1/admin/organizations', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<typeof formData> }) => {
      await adminApiClient.put(`/v1/admin/organizations/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setEditingOrg(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!confirm('Are you sure you want to delete this organization?')) return;
      await adminApiClient.delete(`/v1/admin/organizations/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-organizations'] }),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      email: '',
      phone: '',
      website: '',
      plan: 'starter',
      timezone: 'UTC',
    });
  };

  const handleStatsClick = async (id: number) => {
    setStatsLoading(true);
    try {
      const res = await adminApiClient.get(`/v1/admin/organizations/${id}/statistics`);
      setViewingStats(res.data.data);
    } catch {
      alert('Failed to load organization statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleEditClick = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      email: org.email,
      phone: org.phone || '',
      website: org.website || '',
      plan: org.plan || 'starter',
      timezone: org.timezone || 'UTC',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Organizations & Tenants
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Multi-tenant organization accounts isolated in MySQL database.
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
          <span>New Organization</span>
        </button>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by organization name, slug, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Contact Email</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading organizations from crm_admin...
                  </td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No organizations found matching your search.
                  </td>
                </tr>
              ) : (
                organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{org.name}</div>
                      <div className="text-xs font-mono text-slate-500">/{org.slug}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{org.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleMutation.mutate(org.id)}
                        disabled={toggleMutation.isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          org.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        {org.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleStatsClick(org.id)}
                        title="View stats"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(org)}
                        title="Edit organization"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(org.id)}
                        title="Delete organization"
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

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingOrg) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editingOrg ? 'Edit Organization' : 'Create Organization'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingOrg(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingOrg) {
                  updateMutation.mutate({ id: editingOrg.id, payload: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData({ ...formData, name, slug: editingOrg ? formData.slug : slug });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="acme-corp"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="admin@acme.example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="UTC"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingOrg(null);
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
                  {editingOrg ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {viewingStats && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">{viewingStats.name}</h3>
                <p className="text-xs text-slate-400">Tenant Metrics & Usage</p>
              </div>
              <button onClick={() => setViewingStats(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-xs text-slate-400">Subscription Plan</span>
                <span className="text-xs font-mono font-medium text-indigo-400 uppercase">
                  {viewingStats.plan}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-xs text-slate-400">Storage Used</span>
                <span className="text-xs font-mono font-medium text-slate-200">
                  {viewingStats.stats.storage_used_mb} MB
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-xs text-slate-400">API Calls This Month</span>
                <span className="text-xs font-mono font-medium text-emerald-400">
                  {viewingStats.stats.api_calls_this_month.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setViewingStats(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
