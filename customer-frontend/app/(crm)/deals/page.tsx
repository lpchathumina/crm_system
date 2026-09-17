'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BadgeDollarSign,
  Plus,
  Search,
  Building2,
  Calendar,
  DollarSign,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Kanban,
  X,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    customer_id: '',
    amount: '',
    stage: 'qualification',
    probability: '50',
    expected_close_date: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDeals = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (stageFilter) params.append('stage', stageFilter);

      const res = await customerApiClient.get(`/deals?${params.toString()}`);
      setDeals(res.data.data || []);
      setMeta(res.data.meta || { current_page: page, last_page: 1, total: res.data.data?.length || 0 });
    } catch (err) {
      console.error('Failed to fetch deals', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerApiClient.get('/customers?per_page=100');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  useEffect(() => {
    fetchDeals(1);
    fetchCustomers();
  }, [search, stageFilter]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await customerApiClient.post('/deals', {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        amount: parseFloat(formData.amount),
        probability: parseInt(formData.probability),
        currency: 'USD',
      });
      setCreateModalOpen(false);
      setFormData({
        name: '',
        customer_id: '',
        amount: '',
        stage: 'qualification',
        probability: '50',
        expected_close_date: '',
        notes: '',
      });
      fetchDeals(1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create deal');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await customerApiClient.delete(`/deals/${id}`);
      fetchDeals(meta.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete deal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deals & Revenue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer contracts, proposal values, close probabilities, and revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pipeline"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Kanban className="w-4 h-4 text-cyan-400" />
            Kanban Board
          </Link>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Create Deal
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals by deal name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Stages</option>
          <option value="prospecting">Prospecting</option>
          <option value="qualification">Qualification</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed_won">Closed Won</option>
          <option value="closed_lost">Closed Lost</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Deal Name</th>
                <th className="py-3.5 px-4">Customer Account</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Probability</th>
                <th className="py-3.5 px-4">Close Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      Loading deals...
                    </div>
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No deals found. Click "Create Deal" to record an opportunity.
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                          <BadgeDollarSign className="w-4 h-4" />
                        </div>
                        <span>{deal.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {deal.customer ? (
                        <Link
                          href={`/customers/${deal.customer.id}`}
                          className="text-cyan-400 hover:underline flex items-center gap-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{deal.customer.name}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                        {deal.stage?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ${Number(deal.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {deal.probability ? `${deal.probability}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {deal.expected_close_date || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        title="Delete Deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400">
              Page {meta.current_page} of {meta.last_page} ({meta.total} deals)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => fetchDeals(meta.current_page - 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchDeals(meta.current_page + 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5 text-cyan-400" />
                Create New Deal Opportunity
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Annual Cloud Infrastructure License"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Account *</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Value ($) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                  >
                    <option value="prospecting">Prospecting</option>
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
