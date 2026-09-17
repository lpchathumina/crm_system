'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import { KeyRound, Shield, Loader2, CheckCircle2 } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export default function PermissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => {
      const res = await adminApiClient.get('/v1/admin/permissions');
      return res.data.data;
    },
  });

  const permissions: Permission[] = data || [];

  // Group permissions by prefix (e.g. admin.users.*, admin.organizations.*)
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const parts = perm.name.split('.');
    const category = parts.length > 1 ? parts[1] : 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          Granular Permission Directives
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Registered security permissions assigned to administrative guards.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading permissions...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(grouped).map(([category, perms]) => (
            <div
              key={category}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  {category}
                </h3>
                <span className="text-xs text-slate-500 font-mono">{perms.length} directives</span>
              </div>

              <div className="space-y-2">
                {perms.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 font-mono"
                  >
                    <span className="truncate pr-2">{p.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" /> sanctum
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
