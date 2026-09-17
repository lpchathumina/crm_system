import { useState } from 'react';
import { PaginationMeta } from '@/types';

export function usePagination(initialPage = 1, initialPerPage = 15) {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: initialPage,
    last_page: 1,
    per_page: initialPerPage,
    total: 0,
  });

  const updateMeta = (newMeta: Partial<PaginationMeta>) => {
    setMeta((prev) => ({ ...prev, ...newMeta }));
  };

  const nextPage = () => {
    if (page < meta.last_page) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= meta.last_page) setPage(p);
  };

  return {
    page,
    perPage,
    meta,
    setPage,
    setPerPage,
    updateMeta,
    nextPage,
    prevPage,
    goToPage,
  };
}
