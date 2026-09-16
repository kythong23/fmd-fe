import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalItems, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-body-sm text-text-secondary">
        Trang <strong className="text-text-primary">{page}</strong> / {totalPages} — {totalItems}{' '}
        mục
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft className="size-4" />}
        >
          Trước
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight className="size-4" />}
        >
          Sau
        </Button>
      </div>
    </nav>
  );
}
