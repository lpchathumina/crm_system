import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMeta } from '@/types';

interface DataTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function DataTablePagination({
  meta,
  onPageChange,
  isLoading = false,
}: DataTablePaginationProps) {
  const { current_page, last_page, total } = meta;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400">
      <div>
        Showing page <span className="font-semibold text-slate-200">{current_page}</span> of{' '}
        <span className="font-semibold text-slate-200">{last_page}</span> ({total} records)
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={current_page <= 1 || isLoading}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1 || isLoading}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 font-mono font-semibold text-slate-200 bg-slate-800/80 rounded-lg border border-slate-700">
          {current_page} / {last_page}
        </span>

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page || isLoading}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(last_page)}
          disabled={current_page >= last_page || isLoading}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
