import React from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Deal } from '@/types';
import { formatCurrency } from '@/lib/utils/helpers';

interface KanbanCardProps {
  deal: Deal;
  stageIndex: number;
  totalStages: number;
  onMoveStage: (dealId: number, currentStage: string, direction: 'next' | 'prev') => void;
  isUpdating?: boolean;
}

export function KanbanCard({
  deal,
  stageIndex,
  totalStages,
  onMoveStage,
  isUpdating = false,
}: KanbanCardProps) {
  return (
    <div
      className={`p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition shadow-md group ${
        isUpdating ? 'opacity-50 pointer-events-none' : ''
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
          {formatCurrency(deal.amount)}
        </div>
        <span className="text-[10px] text-slate-400">
          {deal.probability ? `${deal.probability}% win` : ''}
        </span>
      </div>

      {/* Quick stage navigation controls */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/40">
        <button
          disabled={stageIndex === 0}
          onClick={() => onMoveStage(deal.id, deal.stage, 'prev')}
          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 text-[10px] flex items-center gap-0.5"
          title="Move to previous stage"
        >
          <ChevronLeft className="w-3 h-3" />
          Prev
        </button>

        <button
          disabled={stageIndex === totalStages - 1}
          onClick={() => onMoveStage(deal.id, deal.stage, 'next')}
          className="p-1 px-2 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 disabled:opacity-20 text-[10px] font-bold flex items-center gap-0.5"
          title="Advance to next stage"
        >
          Advance
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
