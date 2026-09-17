'use client';

import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/lib/utils/helpers';

interface AuditLogDetailModalProps {
  open: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export function AuditLogDetailModal({
  open,
  onClose,
  log,
}: AuditLogDetailModalProps) {
  if (!log) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Audit Event Details"
      description={`Event ID #${log.id} · Recorded on ${formatDateTime(log.created_at)}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <span className="text-slate-400">Action:</span>
            <div className="mt-0.5">
              <Badge variant="info">{log.action}</Badge>
            </div>
          </div>
          <div>
            <span className="text-slate-400">Actor / Administrator:</span>
            <p className="font-semibold text-slate-200 mt-0.5">
              {log.user?.name || `User #${log.user_id || 'System'}`}
            </p>
          </div>
          <div>
            <span className="text-slate-400">IP Address:</span>
            <p className="font-mono text-slate-200 mt-0.5">{log.ip_address || '—'}</p>
          </div>
          <div>
            <span className="text-slate-400">Target Entity:</span>
            <p className="font-medium text-slate-200 mt-0.5">
              {log.model_type ? `${log.model_type} #${log.model_id}` : '—'}
            </p>
          </div>
        </div>

        {log.description && (
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400 block mb-1">Description:</span>
            <p className="text-slate-200">{log.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-slate-300 block mb-1">Old Values (Previous State):</span>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-48">
              {log.old_values ? JSON.stringify(log.old_values, null, 2) : 'null'}
            </pre>
          </div>
          <div>
            <span className="font-bold text-slate-300 block mb-1">New Values (Modified State):</span>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
              {log.new_values ? JSON.stringify(log.new_values, null, 2) : 'null'}
            </pre>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-800 mt-6">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
