'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Plus,
  Phone,
  Video,
  Mail,
  FileText,
  Clock,
  Trash2,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'call',
    description: '',
    duration_minutes: '15',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (typeFilter) params.append('type', typeFilter);

      const res = await customerApiClient.get(`/activities?${params.toString()}`);
      setActivities(res.data.data || []);
      setMeta(res.data.meta || { current_page: page, last_page: 1, total: res.data.data?.length || 0 });
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, [typeFilter]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await customerApiClient.post('/activities', {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        performed_at: new Date().toISOString(),
      });
      setCreateModalOpen(false);
      setFormData({
        title: '',
        type: 'call',
        description: '',
        duration_minutes: '15',
      });
      fetchActivities(1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setFormLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4 text-cyan-400" />;
      case 'meeting':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyan-400" />
            Activity Stream & Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of customer meetings, phone calls, communications, and internal updates
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Log Activity
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { label: 'All Activities', value: '' },
          { label: 'Calls', value: 'call' },
          { label: 'Meetings', value: 'meeting' },
          { label: 'Emails', value: 'email' },
          { label: 'Notes', value: 'note' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTypeFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === tab.value
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activities Timeline List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading timeline...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No activities recorded yet. Click "Log Activity" to register a call or meeting.
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 flex-shrink-0 mt-0.5">
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100 truncate">{act.title}</h4>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>
                {act.description && (
                  <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">{act.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {act.type}
                  </span>
                  {act.duration_minutes && (
                    <span>Duration: {act.duration_minutes} mins</span>
                  )}
                  {act.causer && <span>Logged by: {act.causer.name}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Activity Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Log Interaction Activity
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

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Discovery Call with VP of Technology"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                  >
                    <option value="call">Phone Call</option>
                    <option value="meeting">Meeting / Demo</option>
                    <option value="email">Email</option>
                    <option value="note">Note / Debrief</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Summary</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Discussion takeaways, next steps agreed upon..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
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
                  {formLoading ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
