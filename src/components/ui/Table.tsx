import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Cột được ưu tiên hiển thị ở biến thể card trên mobile */
  primary?: boolean;
  sortable?: boolean;
  className?: string;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableProps<T> {
  caption: string;
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** < md: 'cards' đổi sang danh sách thẻ, 'scroll' cuộn ngang trong khung */
  mobileVariant?: 'cards' | 'scroll';
}

export function Table<T>({
  caption,
  columns,
  data,
  rowKey,
  loading = false,
  emptyState,
  onRowClick,
  sort,
  onSortChange,
  mobileVariant = 'cards',
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) return <>{emptyState}</>;

  function toggleSort(key: string) {
    if (!onSortChange) return;
    const direction = sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ key, direction });
  }

  return (
    <>
      {/* Mobile: danh sách thẻ — bảng không phá layout hẹp */}
      {mobileVariant === 'cards' && (
        <ul className="flex flex-col gap-2 md:hidden">
          {data.map((row) => (
            <li key={rowKey(row)}>
              <RowCard row={row} columns={columns} onRowClick={onRowClick} />
            </li>
          ))}
        </ul>
      )}

      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-border bg-surface',
          mobileVariant === 'cards' && 'hidden md:block',
        )}
      >
        <table className="w-full border-collapse text-body-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-surface-sunken">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sort?.key === column.key
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    'px-4 py-3 text-left text-caption font-bold tracking-wide text-text-secondary uppercase',
                    column.className,
                  )}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    >
                      {column.header}
                      {sort?.key === column.key &&
                        (sort.direction === 'asc' ? (
                          <ArrowUp aria-hidden className="size-4" />
                        ) : (
                          <ArrowDown aria-hidden className="size-4" />
                        ))}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-border last:border-0',
                  onRowClick && 'cursor-pointer transition-colors hover:bg-surface-hover',
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RowCard<T>({
  row,
  columns,
  onRowClick,
}: {
  row: T;
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}) {
  const [primary, ...rest] = [...columns].sort(
    (a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)),
  );
  const content = (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">{primary?.render(row)}</div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        {rest.map((column) => (
          <div key={column.key} className="flex flex-col">
            <dt className="text-caption text-text-muted">{column.header}</dt>
            <dd className="text-body-sm text-text-primary">{column.render(row)}</dd>
          </div>
        ))}
      </dl>
    </>
  );

  if (!onRowClick) {
    return <div className="rounded-lg border border-border bg-surface p-4">{content}</div>;
  }
  return (
    <button
      type="button"
      onClick={() => onRowClick(row)}
      className="w-full rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      {content}
    </button>
  );
}
