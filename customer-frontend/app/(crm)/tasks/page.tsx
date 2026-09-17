'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Building2,
  X,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    customer_id: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTasks = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (statusFilter) params.append('status', statusFilter);

      const res = await customerApiClient.get(`/tasks?${params.toString()}`);
      setTasks(res.data.data || []);
      setMeta(res.data.meta || { current_page: page, last_page: 1, total: res.data.data?.length || 0 });
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerApiClient.get('/customers?per_page=100');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load customers for tasks', err);
    }
  };

  useEffect(() => {
    fetchTasks(1);
    fetchCustomers();
  }, [statusFilter]);

  const handleToggleTask = async (id: number) => {
    try {
      await customerApiClient.put(`/tasks/${id}/toggle`);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
            : t
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle task completion');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await customerApiClient.post('/tasks', {
        ...formData,
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      });
      setCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
        customer_id: '',
      });
      fetchTasks(1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await customerApiClient.delete(`/tasks/${id}`);
      fetchTasks(meta.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            Task Management & Follow-ups
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize action items, deadlines, high-priority customer deliverables
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Tabs / Filters */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { label: 'All Tasks', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === tab.value
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No tasks found in this view.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue =
              task.due_date &&
              new Date(task.due_date).getTime() < Date.now() &&
              !isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : isOverdue
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'border border-slate-700 hover:border-cyan-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                      {task.customer && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          <span>{task.customer.name}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div
                          className={`flex items-center gap-1 ${
                            isOverdue ? 'text-amber-400 font-bold' : ''
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Due: {task.due_date}</span>
                          {isOverdue && <span className="uppercase text-[9px] ml-1">(Overdue)</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" />
                Create Action Item
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

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule Product Demo Presentation"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details, agenda, follow-up checklist..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Customer Account</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                >
                  <option value="">No Customer Link (General Task)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
                  {formLoading ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
