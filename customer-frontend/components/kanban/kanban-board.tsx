'use client';

import React from 'react';
import { Deal } from '@/types';
import { KanbanColumn } from './kanban-column';
import { Spinner } from '@/components/ui/spinner';
import { CRM_CONFIG } from '@/config/app';

interface KanbanBoardProps {
  deals: Deal[];
  isLoading?: boolean;
  onMoveStage: (dealId: number, currentStage: string, direction: 'next' | 'prev') => void;
  updatingId?: number | null;
}

export function KanbanBoard({
  deals,
  isLoading = false,
  onMoveStage,
  updatingId,
}: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Spinner size="md" />
          <span>Loading pipeline deals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 min-w-[1300px] h-full items-start">
      {CRM_CONFIG.pipelineStages.map((stage, idx) => {
        const stageDeals = deals.filter((d) => d.stage === stage.id);
        return (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            stageIndex={idx}
            totalStages={CRM_CONFIG.pipelineStages.length}
            deals={stageDeals}
            onMoveStage={onMoveStage}
            updatingId={updatingId}
          />
        );
      })}
    </div>
  );
}
