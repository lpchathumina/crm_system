'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Kanban,
  Plus,
  Building2,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';

const STAGES = [
  { id: 'prospecting', name: 'Prospecting', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'qualification', name: 'Qualification', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
  { id: 'proposal', name: 'Proposal', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'negotiation', name: 'Negotiation', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  { id: 'closed_won', name: 'Closed Won', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await customerApiClient.get('/deals?per_page=100');
      setDeals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load pipeline deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleMoveStage = async (dealId: number, currentStage: string, direction: 'next' | 'prev') => {
    const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= STAGES.length) return;

    const newStage = STAGES[targetIndex].id;
    setUpdatingId(dealId);

    try {
      await customerApiClient.put(`/deals/${dealId}/stage`, { stage: newStage });
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update deal stage');
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateStageTotal = (stageId: string) => {
    return deals
      .filter((d) => d.stage === stageId)
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Kanban className="w-6 h-6 text-cyan-400" />
            Sales Pipeline Kanban
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual deal flow across qualification, proposal, negotiation, and closing stages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/deals"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Table View
          </Link>
          <Link
            href="/deals"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </Link>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex-1 overflow-x-auto pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              Loading pipeline deals...
            </div>
          </div>
        ) : (
          <div className="flex gap-4 min-w-[1300px] h-full items-start">
            {STAGES.map((stage, stageIdx) => {
              const stageDeals = deals.filter((d) => d.stage === stage.id);
              const stageTotal = calculateStageTotal(stage.id);

              return (
                <div
                  key={stage.id}
                  className="w-72 flex-shrink-0 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col max-h-full"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${stage.color}`}>
                        {stage.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {stageDeals.length}
                      </span>
                    </div>
                    <div className="text-sm font-mono font-bold text-slate-200">
                      ${stageTotal.toLocaleString()}
                    </div>
                  </div>

                  {/* Column Cards List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {stageDeals.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-xl text-xs text-slate-400">
                        No deals in this stage
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className={`p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition shadow-md group ${
                            updatingId === deal.id ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-100 leading-tight">
                              {deal.name}
                            </h4>
                          </div>

                          {deal.customer && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                              <Building2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                              <span className="truncate">{deal.customer.name}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80">
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              ${Number(deal.amount || 0).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {deal.probability ? `${deal.probability}% win` : ''}
                            </span>
                          </div>

                          {/* Quick stage navigation controls */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/40">
                            <button
                              disabled={stageIdx === 0}
                              onClick={() => handleMoveStage(deal.id, deal.stage, 'prev')}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 text-[10px] flex items-center gap-0.5"
                              title="Move to previous stage"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              Prev
                            </button>

                            <button
                              disabled={stageIdx === STAGES.length - 1}
                              onClick={() => handleMoveStage(deal.id, deal.stage, 'next')}
                              className="p-1 px-2 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 disabled:opacity-20 text-[10px] font-bold flex items-center gap-0.5"
                              title="Advance to next stage"
                            >
                              Advance
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
