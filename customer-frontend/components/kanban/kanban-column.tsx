import React from 'react';
import { Deal } from '@/types';
import { KanbanCard } from './kanban-card';
import { formatCurrency } from '@/lib/utils/helpers';

interface KanbanColumnProps {
  stage: { id: string; name: string; color: string };
  stageIndex: number;
  totalStages: number;
  deals: Deal[];
  onMoveStage: (dealId: number, currentStage: string, direction: 'next' | 'prev') => void;
  updatingId?: number | null;
}

export function KanbanColumn({
  stage,
  stageIndex,
  totalStages,
  deals,
  onMoveStage,
  updatingId,
}: KanbanColumnProps) {
  const stageTotal = deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="w-72 flex-shrink-0 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col max-h-full">
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${stage.color}`}>
            {stage.name}
          </span>
          <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <div className="text-sm font-mono font-bold text-slate-200">
          {formatCurrency(stageTotal)}
        </div>
      </div>

      {/* Column Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {deals.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-xl text-xs text-slate-400">
            No deals in this stage
          </div>
        ) : (
          deals.map((deal) => (
            <KanbanCard
              key={deal.id}
              deal={deal}
              stageIndex={stageIndex}
              totalStages={totalStages}
              onMoveStage={onMoveStage}
              isUpdating={updatingId === deal.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
