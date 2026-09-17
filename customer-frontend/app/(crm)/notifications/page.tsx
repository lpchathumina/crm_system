'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await customerApiClient.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await customerApiClient.put('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      alert('Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await customerApiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-cyan-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System alerts, deal status updates, task deadlines, and lead conversion notifications
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <CheckCheck className="w-4 h-4 text-cyan-400" />
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No notifications in your inbox.
          </div>
        ) : (
          notifications.map((n) => {
            const isRead = !!n.read_at;
            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  isRead
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      isRead ? 'bg-slate-700' : 'bg-cyan-400'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{n.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 whitespace-pre-wrap">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1 text-slate-400 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
