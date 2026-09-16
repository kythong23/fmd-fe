import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { TREE_STATUSES } from '@/constants/status-config';
import type { TreeFilters, TreeStatus } from '@/types';

export interface TreeFilterState extends TreeFilters {
  page: number;
}

/** Filter/search/page nằm ở URL để share và back được (05_FRONTEND §7) */
export function useTreeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<TreeFilterState>(() => {
    const status = searchParams.get('status');
    return {
      q: searchParams.get('q') ?? undefined,
      status: TREE_STATUSES.includes(status as TreeStatus) ? (status as TreeStatus) : undefined,
      block: searchParams.get('block') ?? undefined,
      page: Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1),
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<TreeFilterState>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '' || value === null) next.delete(key);
            else next.set(key, String(value));
          }
          // Đổi bộ lọc thì quay về trang 1, trừ khi chính page được đổi
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clear = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const hasFilters = Boolean(filters.q || filters.status || filters.block);

  return { filters, setFilters, clear, hasFilters };
}
