import { useNavigate, useSearchParams } from 'react-router';
import { ScrollText, Search } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Input, Select, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { HistoryTimeline } from '@/components/shared/HistoryTimeline';
import { useActivityFeed } from '@/hooks/tree-queries';
import { useDebounce } from '@/hooks/use-debounce';
import { ACTIVITY_CONFIG, ACTIVITY_TYPES } from '@/constants/activity-types';
import { ROUTES } from '@/constants/routes';
import type { ActivityType } from '@/types';

const TYPE_OPTIONS = ACTIVITY_TYPES.map((type) => ({
  value: type,
  label: ACTIVITY_CONFIG[type].label,
}));

export default function ActivityPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const type = (searchParams.get('type') ?? '') as ActivityType | '';
  const debouncedQuery = useDebounce(q, 300);

  const query = useActivityFeed({
    q: debouncedQuery || undefined,
    type: type || undefined,
  });

  function setParam(key: string, value: string) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  const records = query.data ?? [];
  const hasFilters = Boolean(q || type);

  return (
    <PageContainer>
      <PageHeader
        title="Nhật ký vườn"
        description="Toàn bộ ghi nhận của mọi cây, sắp xếp theo thời gian thực tế."
        breadcrumbs={[{ label: 'Tổng quan', to: ROUTES.dashboard }, { label: 'Nhật ký vườn' }]}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Tìm trong nhật ký"
          placeholder="Mã cây, nội dung hoặc người thực hiện"
          leftIcon={<Search className="size-5" />}
          value={q}
          onChange={(event) => setParam('q', event.target.value)}
          containerClassName="flex-1"
        />
        <Select
          label="Loại hoạt động"
          placeholder="Tất cả hoạt động"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(event) => setParam('type', event.target.value)}
          containerClassName="sm:w-56"
        />
      </div>

      <StateBoundary
        isLoading={query.isPending}
        error={query.error}
        isEmpty={records.length === 0}
        onRetry={() => query.refetch()}
        skeleton={
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        }
        empty={
          <EmptyState
            icon={ScrollText}
            title={hasFilters ? 'Không có ghi nhận nào khớp' : 'Vườn chưa có ghi nhận nào'}
            description={
              hasFilters
                ? 'Thử đổi từ khóa hoặc chọn loại hoạt động khác.'
                : 'Nhật ký sẽ đầy lên sau mỗi lần nhân công cập nhật tình trạng cây.'
            }
          />
        }
      >
        <HistoryTimeline
          records={records}
          onTreeClick={(code) => navigate(ROUTES.tree(code))}
        />
      </StateBoundary>
    </PageContainer>
  );
}
