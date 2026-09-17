'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Users,
  BadgeDollarSign,
  CheckSquare,
  History,
  FileText,
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  Plus,
  Calendar,
  Clock,
  Trash2,
  DollarSign
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'deals' | 'tasks' | 'notes' | 'activities'>('overview');

  // Quick note modal/form
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await customerApiClient.get(`/customers/${id}`);
      setCustomer(res.data.data);
    } catch (err) {
      console.error('Failed to load customer', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      await customerApiClient.post('/notes', {
        body: newNote,
        noteable_type: 'customer',
        noteable_id: id,
      });
      setNewNote('');
      fetchCustomer();
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Customer account not found.</p>
        <Link href="/customers" className="mt-4 inline-block text-cyan-400 text-xs font-semibold">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">{customer.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {customer.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {customer.industry || 'General Industry'} · Added on {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Top Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Email</span>
          <div className="text-sm font-medium text-slate-100 mt-1 truncate">
            {customer.email || 'None provided'}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Phone</span>
          <div className="text-sm font-medium text-slate-100 mt-1 truncate">
            {customer.phone || 'None provided'}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Website</span>
          <div className="text-sm font-medium text-slate-100 mt-1 truncate">
            {customer.website ? (
              <a
                href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                {customer.website}
              </a>
            ) : (
              'None'
            )}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Annual Revenue</span>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
            ${Number(customer.annual_revenue || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Building2 },
          { id: 'contacts', label: `Contacts (${customer.contacts?.length || 0})`, icon: Users },
          { id: 'deals', label: `Deals (${customer.deals?.length || 0})`, icon: BadgeDollarSign },
          { id: 'tasks', label: `Tasks (${customer.tasks?.length || 0})`, icon: CheckSquare },
          { id: 'notes', label: `Notes (${customer.notes?.length || 0})`, icon: FileText },
          { id: 'activities', label: `Activities (${customer.activities?.length || 0})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Company Information</h3>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Type</span>
                  <span className="capitalize text-slate-200 font-medium">{customer.type || 'Company'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Industry</span>
                  <span className="text-slate-200 font-medium">{customer.industry || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Address</span>
                  <span className="text-slate-200 font-medium">
                    {customer.address_line_1 ? `${customer.address_line_1}, ${customer.city || ''} ${customer.country || ''}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Account Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400">Active Contacts</span>
                  <div className="text-2xl font-bold text-white mt-1">{customer.contacts?.length || 0}</div>
                </div>
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400">Associated Deals</span>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">{customer.deals?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Associated Contacts</h3>
              <Link
                href="/contacts"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                Manage Contacts →
              </Link>
            </div>
            {(!customer.contacts || customer.contacts.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No contacts associated with this account yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {customer.contacts.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                    <p className="font-semibold text-slate-200 text-sm">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-cyan-400">{c.job_title || 'Contact'}</p>
                    <div className="mt-3 space-y-1 text-xs text-slate-400">
                      <div>Email: {c.email || '—'}</div>
                      <div>Phone: {c.phone || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Associated Deals</h3>
              <Link
                href="/deals"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                Create New Deal →
              </Link>
            </div>
            {(!customer.deals || customer.deals.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No deals created for this customer.</p>
            ) : (
              <div className="space-y-2">
                {customer.deals.map((d: any) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-100">{d.name}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                        {d.stage}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        ${Number(d.amount || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400">{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Action Items & Tasks</h3>
              <Link href="/tasks" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                Tasks Board →
              </Link>
            </div>
            {(!customer.tasks || customer.tasks.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No open tasks for this customer.</p>
            ) : (
              <div className="space-y-2">
                {customer.tasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{t.title}</p>
                      <p className="text-[11px] text-slate-400">Due: {t.due_date || 'No due date'}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-5">
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note or meeting takeaways regarding this account..."
                rows={3}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote || !newNote.trim()}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition disabled:opacity-40"
                >
                  {savingNote ? 'Posting...' : 'Post Note'}
                </button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {(!customer.notes || customer.notes.length === 0) ? (
                <p className="text-xs text-slate-400 py-4 text-center">No notes recorded yet.</p>
              ) : (
                customer.notes.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">{n.body}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>By {n.author?.name || 'Team Member'}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-3">
            {(!customer.activities || customer.activities.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No activity history found.</p>
            ) : (
              customer.activities.map((act: any) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{act.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
