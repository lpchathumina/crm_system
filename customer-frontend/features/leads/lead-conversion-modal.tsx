'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { Lead } from '@/types';
import { leadsApi } from './leads-api';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LeadConversionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead: Lead | null;
}

export function LeadConversionModal({
  open,
  onClose,
  onSuccess,
  lead,
}: LeadConversionModalProps) {
  const [createDeal, setCreateDeal] = useState(true);
  const [dealName, setDealName] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealCloseDate, setDealCloseDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setDealName(`${lead.company_name || lead.title} - Expansion Deal`);
      setDealAmount(lead.estimated_value ? String(lead.estimated_value) : '25000');
      setDealCloseDate(
        lead.expected_close_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      setCreateDeal(true);
    }
    setError(null);
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setLoading(true);
    setError(null);

    try {
      await leadsApi.convert(lead.id, {
        create_deal: createDeal,
        deal_name: dealName,
        deal_amount: dealAmount ? parseFloat(dealAmount) : null,
        deal_close_date: dealCloseDate || null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute lead conversion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Convert Lead to Customer & Opportunity"
      description={`Prospect: ${lead?.title || ''}`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 mb-4 text-xs space-y-2 text-slate-300">
        <div className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Automated Transaction Pipeline:
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>
            Create/link Customer Account:{' '}
            <span className="text-slate-200 font-semibold">{lead?.company_name || lead?.title}</span>
          </li>
          <li>
            Create Primary Contact:{' '}
            <span className="text-slate-200 font-semibold">{lead?.first_name || lead?.title}</span>
          </li>
          <li>
            Transition Lead status to{' '}
            <span className="text-purple-400 font-semibold">Converted</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2.5 p-3 bg-slate-950/40 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            id="createDeal"
            checked={createDeal}
            onChange={(e) => setCreateDeal(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700 focus:ring-cyan-500"
          />
          <label htmlFor="createDeal" className="text-xs font-semibold text-slate-200 cursor-pointer">
            Also generate a Sales Opportunity / Deal for this conversion
          </label>
        </div>

        {createDeal && (
          <div className="space-y-3 pt-1">
            <FormField label="Opportunity Title" required>
              <Input
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                placeholder="e.g. Enterprise License Deal"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Deal Value ($)">
                <Input
                  type="number"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(e.target.value)}
                  placeholder="25000"
                />
              </FormField>
              <FormField label="Target Close Date">
                <Input
                  type="date"
                  value={dealCloseDate}
                  onChange={(e) => setDealCloseDate(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" variant="cyan" isLoading={loading}>
            Execute Conversion
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
