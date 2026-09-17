'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import {
  FileClock,
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Code2
} from 'lucide-react';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  model_type: string | null;
  model_id: number | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  description: string | null;
  created_at: string;
  user?: { name: string; email: string };
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs', page, actionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('per_page', '15');
      if (actionFilter) params.set('action', actionFilter);
      const res = await adminApiClient.get(`/v1/admin/audit-logs?${params.toString()}`);
      return res.data;
    },
  });

  const logs: AuditLog[] = data?.data || [];
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0 };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (action.includes('create')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action.includes('login') || action.includes('auth')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileClock className="w-5 h-5 text-amber-400" />
            Security & System Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Comprehensive immutable audit records tracking administrative and tenant activity.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-lg">
        <div className="flex-1 flex gap-2">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Actions</option>
            <option value="login">Login Activity</option>
            <option value="logout">Logout Activity</option>
            <option value="organization_create">Organization Create</option>
            <option value="organization_update">Organization Update</option>
            <option value="organization_delete">Organization Delete</option>
            <option value="organization_status_toggle">Status Toggle</option>
            <option value="password_change">Password Change</option>
            <option value="profile_update">Profile Update</option>
          </select>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Admin User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading audit trail from MySQL crm_admin...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No audit logs recorded for this criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 text-xs">{log.user?.name || 'System'}</div>
                      <div className="text-[11px] text-slate-500">{log.user?.email || `User #${log.user_id}`}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300 max-w-xs truncate">
                      {log.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(log.old_values || log.new_values) && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-mono border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          JSON
                        </button>
                      )}
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

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white font-mono">
                  Audit Payload #{selectedLog.id} ({selectedLog.action})
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs">
              {selectedLog.old_values && (
                <div>
                  <div className="text-rose-400 font-semibold mb-1">Previous State (old_values):</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <div className="text-emerald-400 font-semibold mb-1">New State (new_values):</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
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
