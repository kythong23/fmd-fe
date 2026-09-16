import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { History } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Select, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { HistoryTimeline } from '@/components/shared/HistoryTimeline';
import { useTreeHistory } from '@/hooks/tree-queries';
import { ACTIVITY_CONFIG, ACTIVITY_TYPES } from '@/constants/activity-types';
import { ROUTES } from '@/constants/routes';
import type { ActivityType } from '@/types';

const TYPE_OPTIONS = ACTIVITY_TYPES.map((type) => ({
  value: type,
  label: ACTIVITY_CONFIG[type].label,
}));

export default function TreeHistoryPage() {
  const { code = '' } = useParams();
  const [type, setType] = useState<ActivityType | ''>('');
  const query = useTreeHistory(code);

  const records = useMemo(
    () => (query.data ?? []).filter((record) => !type || record.type === type),
    [query.data, type],
  );

  return (
    <PageContainer>
      <PageHeader
        title={'Lịch sử cây ' + code}
        description="Toàn bộ ghi nhận theo thời gian, mới nhất trước. Bản ghi chỉ thêm, không sửa."
        breadcrumbs={[
          { label: 'Tổng quan', to: ROUTES.dashboard },
          { label: 'Danh sách cây', to: ROUTES.trees },
          { label: code, to: ROUTES.tree(code) },
          { label: 'Lịch sử' },
        ]}
      />

      <div className="mb-4 sm:max-w-xs">
        <Select
          label="Lọc theo loại hoạt động"
          placeholder="Tất cả hoạt động"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(event) => setType(event.target.value as ActivityType | '')}
        />
      </div>

      <StateBoundary
        isLoading={query.isPending}
        error={query.error}
        isEmpty={records.length === 0}
        onRetry={() => query.refetch()}
        skeleton={
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        }
        empty={
          <EmptyState
            icon={History}
            title={type ? 'Không có ghi nhận nào thuộc loại này' : 'Cây chưa có ghi nhận nào'}
            description={
              type
                ? 'Thử chọn loại hoạt động khác hoặc xem tất cả.'
                : 'Cây mới tạo chưa có lịch sử. Bản ghi sẽ xuất hiện sau lần cập nhật tình trạng đầu tiên.'
            }
          />
        }
      >
        <HistoryTimeline records={records} />
      </StateBoundary>
    </PageContainer>
  );
}
