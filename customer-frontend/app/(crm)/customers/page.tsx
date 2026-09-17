'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'company',
    industry: '',
    status: 'active',
    email: '',
    phone: '',
    website: '',
    annual_revenue: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await customerApiClient.get(`/customers?${params.toString()}`);
      setCustomers(res.data.data || []);
      setMeta(res.data.meta || { current_page: page, last_page: 1, total: res.data.data?.length || 0 });
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search, statusFilter]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await customerApiClient.post('/customers', {
        ...formData,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
      });
      setCreateModalOpen(false);
      setFormData({
        name: '',
        type: 'company',
        industry: '',
        status: 'active',
        email: '',
        phone: '',
        website: '',
        annual_revenue: '',
      });
      fetchCustomers(1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create customer account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    try {
      await customerApiClient.delete(`/customers/${id}`);
      fetchCustomers(meta.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your customer organizations, contacts, deals, and interactions
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or industry..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="lead">Lead</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Company / Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Industry</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      Loading accounts...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customers found. Click "Add Customer" to create your first record.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <Link href={`/customers/${c.id}`} className="hover:text-cyan-400 transition">
                          {c.name}
                        </Link>
                        {c.website && (
                          <a
                            href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[11px] text-slate-400 hover:text-cyan-400"
                          >
                            {c.website}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {c.type || 'company'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{c.industry || '—'}</td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${c.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View 360 Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
              Page {meta.current_page} of {meta.last_page} ({meta.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => fetchCustomers(meta.current_page - 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchCustomers(meta.current_page + 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Create New Customer
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

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Account Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Innovations Inc"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                  >
                    <option value="company">Company</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Software, Healthcare"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Revenue ($)</label>
                  <input
                    type="number"
                    value={formData.annual_revenue}
                    onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
                    placeholder="e.g. 500000"
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
                  {formLoading ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
