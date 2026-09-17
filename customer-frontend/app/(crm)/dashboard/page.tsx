'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Target,
  BadgeDollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Activity,
  Calendar,
  DollarSign
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';
import { useCrmAuthStore } from '@/stores/auth.store';

export default function CrmDashboardPage() {
  const { user } = useCrmAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await customerApiClient.get('/dashboard');
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load CRM dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading CRM analytics & workspace data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Error loading dashboard</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentDeals = data?.recent_deals || [];
  const recentActivities = data?.recent_activities || [];
  const pipelineSummary = data?.pipeline_summary || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Partner'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline analytics for <span className="text-cyan-400 font-semibold">{user?.organization?.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/leads"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            New Lead
          </Link>
          <Link
            href="/deals"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
          >
            <BadgeDollarSign className="w-4 h-4" />
            Create Deal
          </Link>
        </div>
      </div>

      {/* Overdue Task Alert if any */}
      {metrics.overdue_tasks > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              You have <span className="font-bold underline">{metrics.overdue_tasks} overdue tasks</span> requiring immediate attention.
            </p>
          </div>
          <Link
            href="/tasks"
            className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition"
          >
            View Tasks
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pipeline Value */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pipeline</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            ${Number(metrics.pipeline_value || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-cyan-400 font-semibold">{metrics.open_deals || 0}</span> open deals in progress
          </div>
        </div>

        {/* Won Revenue */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Won Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            ${Number(metrics.won_revenue || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{metrics.won_deals || 0}</span> closed-won deals
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Win Rate</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.win_rate || 0}%
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-purple-400 font-semibold">{metrics.conversion_rate || 0}%</span> lead conversion
          </div>
        </div>

        {/* Customers & Contacts */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Accounts</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.total_customers || 0}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-blue-400 font-semibold">{metrics.total_contacts || 0}</span> key business contacts
          </div>
        </div>
      </div>

      {/* Sales Pipeline Funnel Overview */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Sales Pipeline Funnel</h2>
            <p className="text-xs text-slate-400 mt-0.5">Active deals distribution across 6 stages</p>
          </div>
          <Link
            href="/pipeline"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Kanban Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map((stage) => {
            const summary = pipelineSummary.find((p: any) => p.stage === stage) || {
              count: 0,
              total_value: 0,
            };
            const label = stage.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            return (
              <div
                key={stage}
                className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                  <div className="text-xl font-bold text-white mt-1">{summary.count} deals</div>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-800/60 text-xs font-mono text-cyan-400 font-semibold">
                  ${Number(summary.total_value || 0).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Section: Recent Deals & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deals Table */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Recent Deals</h3>
              <Link href="/deals" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="pb-2.5">Deal Name</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Stage</th>
                    <th className="pb-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentDeals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No deals recorded yet
                      </td>
                    </tr>
                  ) : (
                    recentDeals.map((deal: any) => (
                      <tr key={deal.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 font-semibold text-slate-100">{deal.name}</td>
                        <td className="py-3 text-slate-400">{deal.customer?.name || '—'}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-cyan-400 border border-slate-700">
                            {deal.stage}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400">
                          ${Number(deal.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Recent Activities</h3>
              <Link href="/activities" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No recent activities logged</p>
              ) : (
                recentActivities.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200 truncate">{act.title}</p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {act.created_at ? new Date(act.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{act.description}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {act.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
