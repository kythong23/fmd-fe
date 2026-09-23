import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowUpDown, Calendar, History, MapPin, PencilLine, QrCode, Search, Sprout } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Badge, Button, Card, Input, Select, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { DateText } from '@/components/shared/DateText';
import { HistoryTimeline } from '@/components/shared/HistoryTimeline';
import { useTree, useTreeHistory } from '@/hooks/tree-queries';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/stores/auth-context';
import { useUi } from '@/stores/ui-context';
import { ACTIVITY_CONFIG, ACTIVITY_TYPES } from '@/constants/activity-types';
import { FRUIT_CONDITION_LABEL, STATUS_CONFIG } from '@/constants/status-config';
import { formatNumber, formatText } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { ActivityType } from '@/types';

const TYPE_OPTIONS = ACTIVITY_TYPES.map((type) => ({
  value: type,
  label: ACTIVITY_CONFIG[type].label,
}));

export default function TreeHistoryPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState<ActivityType | ''>('');
  const [performer, setPerformer] = useState('');
  const [q, setQ] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const debouncedQuery = useDebounce(q, 300);

  const treeQuery = useTree(code);
  const query = useTreeHistory(code);
  const { can } = useAuth();
  const { openUpdate } = useUi();
  const canUpdate = can('tree:update');

  const performerOptions = useMemo(() => {
    const names = new Set((query.data ?? []).map((record) => record.performer));
    return Array.from(names).map((name) => ({ value: name, label: name }));
  }, [query.data]);

  const records = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    const filtered = (query.data ?? []).filter((record) => {
      if (type && record.type !== type) return false;
      if (performer && record.performer !== performer) return false;
      if (needle) {
        const haystack = [
          record.activity,
          record.description,
          record.dosage ?? '',
          ...record.materials.map((item) => item.name),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
    return sortAsc
      ? [...filtered].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
      : filtered;
  }, [query.data, type, performer, debouncedQuery, sortAsc]);

  const total = query.data?.length ?? 0;
  const hasFilters = Boolean(type || performer || debouncedQuery);

  const addButton = canUpdate ? (
    <Button onClick={() => openUpdate(code)} leftIcon={<PencilLine className="size-5" />}>
      Thêm ghi nhận mới
    </Button>
  ) : null;

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
        action={addButton}
      />

      {treeQuery.data && (
        <TreeSummaryCard
          tree={treeQuery.data}
          code={code}
          onShowQr={() => navigate(ROUTES.qr + '?q=' + code)}
        />
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Select
            label="Lọc theo loại hoạt động"
            placeholder="Tất cả hoạt động"
            options={TYPE_OPTIONS}
            value={type}
            onChange={(event) => setType(event.target.value as ActivityType | '')}
            containerClassName="sm:w-56"
          />
          <Select
            label="Người thực hiện"
            placeholder="Tất cả người thực hiện"
            options={performerOptions}
            value={performer}
            onChange={(event) => setPerformer(event.target.value)}
            containerClassName="sm:w-56"
          />
          <Input
            label="Tìm kiếm"
            hideLabel
            placeholder="Tìm phân bón, ghi chú..."
            leftIcon={<Search className="size-5" />}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            containerClassName="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => setSortAsc((v) => !v)}
            leftIcon={<ArrowUpDown className="size-4" />}
            className="shrink-0"
          >
            Thứ tự: {sortAsc ? 'Cũ nhất trước' : 'Mới nhất trước'}
          </Button>
        </div>

        <p className="text-caption text-text-muted">
          Hiển thị <span className="font-bold text-text-primary">{records.length}</span> /{' '}
          {total} bản ghi
        </p>
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
            title={hasFilters ? 'Không có ghi nhận nào khớp' : 'Cây chưa có ghi nhận nào'}
            description={
              hasFilters
                ? 'Thử đổi từ khóa hoặc chọn bộ lọc khác.'
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

function TreeSummaryCard({
  tree,
  code,
  onShowQr,
}: {
  tree: NonNullable<ReturnType<typeof useTree>['data']>;
  code: string;
  onShowQr: () => void;
}) {
  const status = STATUS_CONFIG[tree.status];
  const StatusIcon = status.icon;
  const fruitLabel =
    tree.fruitCondition && tree.fruitCondition !== 'none' ? FRUIT_CONDITION_LABEL[tree.fruitCondition] : null;

  return (
    <Card padding="sm" className="mb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary-hover"
          >
            <Sprout className="size-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-body font-bold text-text-primary">Sầu riêng {tree.variety}</h2>
              <Badge variant={status.badge} icon={<StatusIcon className="size-4" />}>
                {status.label}
                {fruitLabel ? ` - ${fruitLabel}` : ''}
              </Badge>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-secondary">
              <span>
                Mã định danh: <span className="font-mono font-semibold text-text-primary">{tree.code}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {'Lô ' +
                  tree.location.block +
                  ' - Hàng ' +
                  tree.location.row +
                  ' - Cây số ' +
                  tree.location.position}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" aria-hidden />
                Trồng: <DateText value={tree.plantedDate} variant="date" />
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4 sm:gap-5">
          <SummaryStat label="Số trái" value={formatNumber(tree.fruitCount, 'trái')} />
          <SummaryStat label="Chiều cao" value={formatNumber(tree.heightMeters, 'm')} />
          <SummaryStat label="Đ.kính gốc" value={formatNumber(tree.trunkDiameterCm, 'cm')} />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<QrCode className="size-4" />}
            onClick={onShowQr}
          >
            Mã QR {code}
          </Button>
        </div>
      </div>
      {formatText(tree.lastUpdatedBy) !== '—' && (
        <p className="mt-3 border-t border-border pt-2 text-caption text-text-muted">
          Cập nhật lần cuối bởi {tree.lastUpdatedBy} —{' '}
          <DateText value={tree.lastUpdated} variant="relative" />
        </p>
      )}
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-bold tracking-wide text-text-muted uppercase">{label}</p>
      <p className="font-mono text-body-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}
