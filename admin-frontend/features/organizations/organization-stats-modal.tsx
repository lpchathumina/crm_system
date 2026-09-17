'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Organization, OrganizationStats } from '@/types';
import { organizationsApi } from './organizations-api';
import { Users, Building2, BadgeDollarSign, CheckSquare, HardDrive } from 'lucide-react';

interface OrganizationStatsModalProps {
  open: boolean;
  onClose: () => void;
  organization: Organization | null;
}

export function OrganizationStatsModal({
  open,
  onClose,
  organization,
}: OrganizationStatsModalProps) {
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && organization) {
      setLoading(true);
      organizationsApi
        .getStats(organization.id)
        .then((data) => setStats(data))
        .catch(() => setStats(null))
        .finally(() => setLoading(false));
    }
  }, [open, organization]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${organization?.name || 'Organization'} — Live Usage & Statistics`}
      description="Aggregated multi-tenant CRM workspace metrics"
      maxWidth="md"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Spinner size="md" />
          <p className="text-xs text-slate-400">Loading metrics from customer database...</p>
        </div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Active Users</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total_users || 0}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>CRM Accounts</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total_customers || 0}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
                <span>Total Deals</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total_deals || 0}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <span>Open Tasks</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.active_tasks || 0}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span>Database Storage Footprint</span>
            </div>
            <span className="font-mono text-slate-200 font-semibold">{stats.storage_used_mb || 12.4} MB</span>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          No usage statistics available for this organization.
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-800 mt-5">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
