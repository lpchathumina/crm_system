'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    department: '',
    customer_id: '',
    is_primary: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchContacts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);

      const res = await customerApiClient.get(`/contacts?${params.toString()}`);
      setContacts(res.data.data || []);
      setMeta(res.data.meta || { current_page: page, last_page: 1, total: res.data.data?.length || 0 });
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersList = async () => {
    try {
      const res = await customerApiClient.get('/customers?per_page=100');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load customers for dropdown', err);
    }
  };

  useEffect(() => {
    fetchContacts(1);
    fetchCustomersList();
  }, [search]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await customerApiClient.post('/contacts', {
        ...formData,
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      });
      setCreateModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        department: '',
        customer_id: '',
        is_primary: false,
      });
      fetchContacts(1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create contact');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await customerApiClient.delete(`/contacts/${id}`);
      fetchContacts(meta.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Contacts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of key decision-makers, executives, and company liaisons
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by name, email, job title..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Contact Name</th>
                <th className="py-3.5 px-4">Job Title & Dept</th>
                <th className="py-3.5 px-4">Company Account</th>
                <th className="py-3.5 px-4">Direct Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No contacts found. Click "Add Contact" to record a new person.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {c.first_name?.[0] || 'C'}
                      </div>
                      <div>
                        <span>{c.first_name} {c.last_name}</span>
                        {c.is_primary && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-medium">{c.job_title || '—'}</p>
                      <p className="text-slate-400 text-[11px]">{c.department || ''}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.customer ? (
                        <Link
                          href={`/customers/${c.customer.id}`}
                          className="flex items-center gap-1.5 text-cyan-400 hover:underline"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{c.customer.name}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
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
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        title="Delete Contact"
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
              Page {meta.current_page} of {meta.last_page} ({meta.total} contacts)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => fetchContacts(meta.current_page - 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchContacts(meta.current_page + 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Contact Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Add New Contact
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

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="e.g. John"
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
                    placeholder="e.g. Doe"
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
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-0144"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="e.g. VP of Technology"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. IT, Procurement"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Company Account</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                >
                  <option value="">No Associated Customer (Stand-alone)</option>
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700 focus:ring-cyan-500"
                />
                <label htmlFor="is_primary" className="text-xs text-slate-300 font-medium">
                  Set as primary contact for this account
                </label>
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
                  {formLoading ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
