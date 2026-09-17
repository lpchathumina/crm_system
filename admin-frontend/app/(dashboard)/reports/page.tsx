'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  Shield,
  Loader2,
  PieChart,
  RefreshCw
} from 'lucide-react';

export default function ReportsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await adminApiClient.get('/v1/admin/reports');
      return res.data.data;
    },
  });

  const report = data || {};
  const summary = report.summary || {};
  const plans: Record<string, number> = report.plans || {};
  const growth = report.growth || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            System Performance & Adoption Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Aggregated metrics derived from live MySQL database crm_admin.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Report
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Generating administrative reports...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Total Tenants</span>
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-3">
                {summary.total_organizations ?? 0}
              </div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" />
                {summary.active_organizations ?? 0} active ({summary.inactive_organizations ?? 0} inactive)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Platform Admins</span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-3">
                {summary.total_admins ?? 0}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {summary.active_admins ?? 0} active administrators
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Audit Logs Recorded</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-3">
                {summary.total_audit_events ?? 0}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">Tamper-evident audit trail</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Plan Conversion Rate</span>
                <PieChart className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-3">
                {summary.total_organizations > 0
                  ? Math.round(((summary.total_organizations - (plans['free'] || 0)) / summary.total_organizations) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-amber-400 mt-1 font-mono">Paid subscription tiers</p>
            </div>
          </div>

          {/* Detailed Breakdown Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Tiers */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                Organizations By Subscription Plan
              </h3>

              <div className="space-y-3 pt-1">
                {Object.entries(plans).map(([plan, count]) => {
                  const percentage = summary.total_organizations > 0 ? (count / summary.total_organizations) * 100 : 0;
                  return (
                    <div key={plan} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="capitalize text-slate-300">{plan}</span>
                        <span className="text-slate-400">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Growth Over Time */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Tenant Growth (2026 Q1-Q2)
              </h3>

              <div className="grid grid-cols-4 gap-3 pt-2 text-center">
                {growth.map((g: any) => (
                  <div key={g.month} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="text-xs text-slate-400 font-mono">{g.month}</div>
                    <div className="text-lg font-bold text-white font-mono mt-1">{g.organizations}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+tenants</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
