'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
  PieChart,
  Calendar
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [leadsReport, setLeadsReport] = useState<any>(null);
  const [activitiesReport, setActivitiesReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [salesRes, leadsRes, actRes] = await Promise.all([
          customerApiClient.get('/reports/sales'),
          customerApiClient.get('/reports/leads'),
          customerApiClient.get('/reports/activities'),
        ]);
        setSalesReport(salesRes.data.data);
        setLeadsReport(leadsRes.data.data);
        setActivitiesReport(actRes.data.data);
      } catch (err) {
        console.error('Failed to load CRM reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          CRM Analytics & Performance Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          In-depth sales velocity, lead acquisition performance, and representative activity tracking
        </p>
      </div>

      {/* Top Sales Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Won Revenue</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ${Number(salesReport?.total_sales || 0).toLocaleString()}
          </div>
          <p className="text-xs text-emerald-400 mt-1 font-medium">{salesReport?.won_deals || 0} deals won</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Pipeline Value</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ${Number(salesReport?.pipeline_value || 0).toLocaleString()}
          </div>
          <p className="text-xs text-cyan-400 mt-1 font-medium">{salesReport?.open_deals || 0} active deals</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sales Win Rate</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {salesReport?.win_rate || 0}%
          </div>
          <p className="text-xs text-slate-400 mt-1">{salesReport?.lost_deals || 0} deals lost</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lead Conversion Rate</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {leadsReport?.conversion_rate || 0}%
          </div>
          <p className="text-xs text-purple-400 mt-1 font-medium">{leadsReport?.total_leads || 0} total leads generated</p>
        </div>
      </div>

      {/* Grid: Leads by Status & Leads by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads By Status */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Leads Distribution by Status
          </h3>
          <div className="space-y-3">
            {leadsReport?.by_status?.length > 0 ? (
              leadsReport.by_status.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="capitalize text-xs font-semibold text-slate-200">{item.status}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-cyan-400">{item.count} leads</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No lead status data available</p>
            )}
          </div>
        </div>

        {/* Leads By Source */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            Leads Distribution by Source
          </h3>
          <div className="space-y-3">
            {leadsReport?.by_source?.length > 0 ? (
              leadsReport.by_source.map((item: any) => (
                <div key={item.source} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="capitalize text-xs font-semibold text-slate-200">{item.source || 'Organic'}</span>
                  <span className="text-xs font-bold text-purple-400">{item.count} prospects</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No lead source data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Activities Breakdown */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Engagement Activities Completed ({activitiesReport?.total_activities || 0} Total)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activitiesReport?.by_type?.map((item: any) => (
            <div key={item.type} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
              <span className="text-xs uppercase font-bold text-slate-400">{item.type}</span>
              <div className="text-2xl font-bold text-white mt-1">{item.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
