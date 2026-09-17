'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BadgeDollarSign
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Conversion state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [convertData, setConvertData] = useState({
    create_deal: true,
    deal_name: '',
    deal_amount: '',
    deal_close_date: '',
  });
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  // Create lead form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    job_title: '',
    source: 'website',
    status: 'new',
    estimated_value: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchLeads = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await customerApiClient.get(`/leads?${params.toString()}`);
      setLeads(res.data.data || []);
      setMeta(res.data.meta || { current_page: page, last_page: 1, total: res.data.data?.length || 0 });
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [search, statusFilter]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await customerApiClient.post('/leads', {
        ...formData,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
      });
      setCreateModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        job_title: '',
        source: 'website',
        status: 'new',
        estimated_value: '',
        notes: '',
      });
      fetchLeads(1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setFormLoading(false);
    }
  };

  const openConvertModal = (lead: any) => {
    setSelectedLead(lead);
    setConvertData({
      create_deal: true,
      deal_name: `${lead.company_name || lead.first_name} - Contract Opportunity`,
      deal_amount: lead.estimated_value ? lead.estimated_value.toString() : '25000',
      deal_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setConvertError(null);
    setConvertModalOpen(true);
  };

  const handleExecuteConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setConvertLoading(true);
    setConvertError(null);

    try {
      await customerApiClient.post(`/leads/${selectedLead.id}/convert`, {
        create_deal: convertData.create_deal,
        deal_name: convertData.deal_name,
        deal_amount: convertData.deal_amount ? parseFloat(convertData.deal_amount) : null,
        deal_close_date: convertData.deal_close_date || null,
      });
      setConvertModalOpen(false);
      fetchLeads(meta.current_page);
      alert(`Lead ${selectedLead.first_name} ${selectedLead.last_name} was successfully converted into a Customer, Contact, and Opportunity Deal!`);
    } catch (err: any) {
      setConvertError(err.response?.data?.message || 'Failed to convert lead. Please verify data.');
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads & Prospects</h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture, qualify, and convert prospects into high-value customer accounts
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Capture Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by prospect name, company, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="unqualified">Unqualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Prospect / Company</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Estimated Value</th>
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
                      Loading pipeline leads...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isConverted = lead.status === 'converted';
                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                            <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-slate-100">{lead.first_name} {lead.last_name}</span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Building2 className="w-3 h-3" />
                              <span>{lead.company_name || 'Individual Prospect'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{lead.email || '—'}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {lead.source || 'Website'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ${Number(lead.estimated_value || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isConverted
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : lead.status === 'qualified'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-cyan-400'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isConverted ? (
                          <span className="text-xs text-slate-400 flex items-center justify-end gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Converted
                          </span>
                        ) : (
                          <button
                            onClick={() => openConvertModal(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition shadow-sm"
                            title="Convert into Customer + Contact + Deal"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Convert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400">
              Page {meta.current_page} of {meta.last_page} ({meta.total} leads)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => fetchLeads(meta.current_page - 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchLeads(meta.current_page + 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Convert Lead Workflow Modal */}
      {convertModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Convert Lead to Account</h3>
                  <p className="text-xs text-slate-400">
                    Lead: {selectedLead.first_name} {selectedLead.last_name} ({selectedLead.company_name})
                  </p>
                </div>
              </div>
              <button onClick={() => setConvertModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {convertError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{convertError}</span>
              </div>
            )}

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 mb-4 text-xs space-y-2 text-slate-300">
              <div className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px]">
                Automated Transaction Steps:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Creates Customer Account: <span className="text-slate-200 font-semibold">{selectedLead.company_name || selectedLead.first_name}</span></li>
                <li>Creates Primary Contact: <span className="text-slate-200 font-semibold">{selectedLead.first_name} {selectedLead.last_name}</span></li>
                <li>Links Lead and updates status to <span className="text-purple-400 font-semibold">Converted</span></li>
              </ul>
            </div>

            <form onSubmit={handleExecuteConversion} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  id="create_deal"
                  checked={convertData.create_deal}
                  onChange={(e) => setConvertData({ ...convertData, create_deal: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700 focus:ring-cyan-500"
                />
                <label htmlFor="create_deal" className="text-xs font-semibold text-slate-200 cursor-pointer">
                  Also create a Sales Opportunity / Deal for this conversion
                </label>
              </div>

              {convertData.create_deal && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Name *</label>
                    <input
                      type="text"
                      required
                      value={convertData.deal_name}
                      onChange={(e) => setConvertData({ ...convertData, deal_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Amount ($)</label>
                      <input
                        type="number"
                        value={convertData.deal_amount}
                        onChange={(e) => setConvertData({ ...convertData, deal_amount: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Target Close Date</label>
                      <input
                        type="date"
                        value={convertData.deal_close_date}
                        onChange={(e) => setConvertData({ ...convertData, deal_close_date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setConvertModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={convertLoading}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  {convertLoading ? 'Executing Conversion...' : 'Execute Conversion'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Capture New Lead
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

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Jane"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Smith"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-0211"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Apex Systems"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="Director of Sales"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    placeholder="e.g. 15000"
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
                  {formLoading ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
