'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import {
  ShieldCheck,
  Plus,
  Trash2,
  X,
  Loader2,
  Check,
  Shield,
  KeyRound
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Array<{ id: number; name: string }>;
}

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Fetch Roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const res = await adminApiClient.get('/v1/admin/roles');
      return res.data.data;
    },
  });

  // Fetch all permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => {
      const res = await adminApiClient.get('/v1/admin/permissions');
      return res.data.data;
    },
  });

  const roles: Role[] = rolesData || [];
  const allPermissions: Array<{ id: number; name: string }> = permissionsData || [];

  const createRoleMutation = useMutation({
    mutationFn: async (name: string) => {
      await adminApiClient.post('/v1/admin/roles', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setIsCreateOpen(false);
      setNewRoleName('');
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: number; permissions: string[] }) => {
      await adminApiClient.put(`/v1/admin/roles/${id}`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      alert('Role permissions updated successfully!');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!confirm('Are you sure you want to delete this role?')) return;
      await adminApiClient.delete(`/v1/admin/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setSelectedRole(null);
    },
  });

  const activeRole = selectedRole || roles[0] || null;

  const handleTogglePermission = (permName: string) => {
    if (!activeRole) return;
    const currentPerms = activeRole.permissions.map((p) => p.name);
    const updatedPerms = currentPerms.includes(permName)
      ? currentPerms.filter((p) => p !== permName)
      : [...currentPerms, permName];

    updatePermissionsMutation.mutate({
      id: activeRole.id,
      permissions: updatedPerms,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Roles & Permissions Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage system roles and configure granular access control policies.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Role</span>
        </button>
      </div>

      {rolesLoading || permissionsLoading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading security roles and permissions...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-xl space-y-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
              Configured Roles ({roles.length})
            </h2>

            {roles.map((r) => {
              const isSelected = activeRole?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/50 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium capitalize">{r.name.replace('-', ' ')}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {r.permissions?.length || 0} permissions
                      </div>
                    </div>
                  </div>

                  {r.name !== 'super-admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoleMutation.mutate(r.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Permissions Matrix */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            {activeRole ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base font-semibold text-white capitalize">
                      {activeRole.name.replace('-', ' ')} Permissions
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Toggle capabilities granted to this administrative role.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {activeRole.permissions?.length || 0} Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {allPermissions.map((perm) => {
                    const isGranted = activeRole.permissions?.some((p) => p.name === perm.name);
                    const isSuperAdmin = activeRole.name === 'super-admin';
                    return (
                      <div
                        key={perm.id}
                        onClick={() => !isSuperAdmin && handleTogglePermission(perm.name)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isSuperAdmin
                            ? 'bg-slate-900/40 border-slate-800 text-slate-400 cursor-not-allowed'
                            : isGranted
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <KeyRound className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-xs font-mono truncate">{perm.name}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 ${
                            isGranted
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'border border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isGranted && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">Select a role to inspect permissions.</div>
            )}
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Create New Role</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newRoleName) createRoleMutation.mutate(newRoleName);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. billing-manager"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
