'use client';

import { useQuery } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import {
  Building2,
  Users,
  ShieldCheck,
  FileClock,
  Server,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Layers,
  Database
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  total_organizations: number;
  active_organizations: number;
  total_admins: number;
  total_audit_events?: number;
  recent_audits?: Array<{
    id: number;
    action: string;
    description: string;
    created_at: string;
    ip_address: string;
    user?: { name: string; email: string };
  }>;
  system_status?: {
    database: string;
    redis: string;
    queue: string;
  };
}

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<{ data: DashboardData }>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await adminApiClient.get('/v1/admin/dashboard');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-900 rounded-xl border border-slate-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-slate-900/50 border border-rose-500/20 rounded-2xl max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-200">Failed to load Admin Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Could not connect to Admin Backend API (Port 8001).</p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Organizations',
      value: stats?.total_organizations ?? 0,
      sub: `${stats?.active_organizations ?? 0} active tenants`,
      icon: Building2,
      color: 'from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30',
      href: '/organizations',
    },
    {
      title: 'Admin Users',
      value: stats?.total_admins ?? 0,
      sub: 'Platform managers & superadmins',
      icon: Users,
      color: 'from-violet-600/20 to-purple-600/20 text-violet-400 border-violet-500/30',
      href: '/users',
    },
    {
      title: 'MySQL Database',
      value: 'crm_admin',
      sub: 'Port 3306 • UTF8MB4',
      icon: Database,
      color: 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
      href: '/audit-logs',
    },
    {
      title: 'System Security',
      value: '100% Isolated',
      sub: 'Role & permission gates enforced',
      icon: ShieldCheck,
      color: 'from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/30',
      href: '/roles',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>System Overview</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage organizations, global administrators, permissions, system settings, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/organizations"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Add Tenant</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="relative group overflow-hidden rounded-2xl p-5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-lg transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border bg-gradient-to-tr ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {card.value}
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Navigation / Feature Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Management */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Administrative Modules
            </h3>
            <span className="text-xs text-slate-500">MySQL Isolated Backend</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/organizations"
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/70 transition-all group"
            >
              <div className="flex items-center justify-between text-indigo-400 group-hover:text-indigo-300">
                <Building2 className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-medium text-slate-200 text-sm mt-3">Organization Tenants</h4>
              <p className="text-xs text-slate-400 mt-1">Create, edit, and toggle active status for tenant companies.</p>
            </Link>

            <Link
              href="/users"
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/70 transition-all group"
            >
              <div className="flex items-center justify-between text-violet-400 group-hover:text-violet-300">
                <Users className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-medium text-slate-200 text-sm mt-3">Admin Users & Profiles</h4>
              <p className="text-xs text-slate-400 mt-1">Manage administrator credentials, status, and role assignments.</p>
            </Link>

            <Link
              href="/roles"
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/70 transition-all group"
            >
              <div className="flex items-center justify-between text-emerald-400 group-hover:text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-medium text-slate-200 text-sm mt-3">Roles & Permission Matrix</h4>
              <p className="text-xs text-slate-400 mt-1">Configure granular access policies and role capabilities.</p>
            </Link>

            <Link
              href="/settings"
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/70 transition-all group"
            >
              <div className="flex items-center justify-between text-amber-400 group-hover:text-amber-300">
                <Server className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-medium text-slate-200 text-sm mt-3">System Settings</h4>
              <p className="text-xs text-slate-400 mt-1">Configure platform parameters, plan limits, and security policies.</p>
            </Link>
          </div>
        </div>

        {/* Database & Infrastructure Status */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-4">
            <Server className="w-4 h-4 text-emerald-400" />
            Infrastructure Status
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-medium text-slate-300">Admin Backend</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">127.0.0.1:8001</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-medium text-slate-300">MySQL Server</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">127.0.0.1:3306</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-medium text-slate-300">Admin DB</span>
              </div>
              <span className="text-xs font-mono text-indigo-400">crm_admin</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-medium text-slate-300">Customer DB</span>
              </div>
              <span className="text-xs font-mono text-indigo-400">crm_customer</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/audit-logs"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
            >
              <FileClock className="w-3.5 h-3.5" />
              View Security Audit Logs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
