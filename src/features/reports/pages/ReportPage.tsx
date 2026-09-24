import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BarChart3, ClipboardList, Download, Layers, Wallet } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Badge, Button, Card, Input, Select, Skeleton, Table, Tabs, useToast } from '@/components/ui';
import type { Column } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { reportsService } from '@/services/reports.service';
import { reportKeys } from '@/services/query-keys';
import { toAppError } from '@/services/http';
import { useTrees } from '@/hooks/tree-queries';
import { MATERIAL_TYPE_CONFIG, MATERIAL_TYPES } from '@/constants/material-types';
import { ACTIVITY_CONFIG } from '@/constants/activity-types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { downloadFile } from '@/utils/qr';
import { ReportStat } from '../components/ReportStat';
import {
  RANGE_PRESETS,
  isDateInput,
  presetRange,
  toExclusive,
  type RangePreset,
} from '../report-range';
import type { MaterialType, ReportFilters, ReportMaterialRow, ReportSummary } from '@/types';

const TYPE_OPTIONS = MATERIAL_TYPES.map((type) => ({
  value: type,
  label: MATERIAL_TYPE_CONFIG[type].label,
}));

type BlockRow = ReportSummary['byBlock'][number];
type TypeRow = ReportSummary['byType'][number];

function TypeBadge({ type }: { type: MaterialType | null }) {
  if (!type) return <Badge variant="neutral">Không rõ</Badge>;
  return <Badge variant={MATERIAL_TYPE_CONFIG[type].variant}>{MATERIAL_TYPE_CONFIG[type].label}</Badge>;
}

/** Vật tư chưa có đơn giá lúc dùng → không hiện "0 đ" trơn (05_FRONTEND §6.14) */
function CostCell({ cost, missingPrice }: { cost: number; missingPrice?: boolean }) {
  if (!missingPrice) return <>{formatNumber(cost, 'đ')}</>;
  return (
    <span className="inline-flex flex-col items-end gap-1">
      {cost > 0 && <span>{formatNumber(cost, 'đ')}</span>}
      <Badge variant="warning">Chưa có đơn giá</Badge>
    </span>
  );
}

export default function ReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  // Toàn bộ bộ lọc nằm trong URL — báo cáo phải gửi link được (05_FRONTEND §6.14)
  const preset = (RANGE_PRESETS.some((item) => item.value === searchParams.get('range'))
    ? searchParams.get('range')
    : 'month') as RangePreset;
  const fallback = presetRange(preset === 'custom' ? 'month' : preset);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const from = isDateInput(fromParam) ? fromParam : fallback.from;
  const to = isDateInput(toParam) ? toParam : fallback.to;
  const block = searchParams.get('block') ?? '';
  const type = (searchParams.get('type') ?? '') as MaterialType | '';
  const rangeError = to < from ? 'Ngày kết thúc phải sau ngày bắt đầu' : undefined;

  const filters: ReportFilters = {
    from,
    to: toExclusive(to),
    block: block || undefined,
    type: type || undefined,
  };

  const query = useQuery({
    queryKey: reportKeys.summary(filters),
    queryFn: () => reportsService.summary(filters),
    enabled: !rangeError,
  });

  const treesQuery = useTrees({ activated: true });
  const blockOptions = useMemo(
    () =>
      Array.from(new Set((treesQuery.data ?? []).map((tree) => tree.location.block)))
        .sort()
        .map((value) => ({ value, label: 'Lô ' + value })),
    [treesQuery.data],
  );

  function updateParams(patch: Record<string, string>) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }

  function selectPreset(value: string) {
    const nextPreset = value as RangePreset;
    // Tuỳ chọn giữ nguyên khoảng đang xem làm điểm xuất phát để sửa
    const range = nextPreset === 'custom' ? { from, to } : presetRange(nextPreset);
    updateParams({ range: nextPreset, ...range });
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const csv = await reportsService.summaryCsv(filters);
      downloadFile(`bao-cao-${from}_${to}.csv`, csv, 'text/csv;charset=utf-8');
    } catch (error) {
      toast.error(toAppError(error).message, 'Xuất CSV thất bại');
    } finally {
      setExporting(false);
    }
  }

  const data = query.data;
  const coverage = data?.coverage;
  const missingCoverage =
    coverage && coverage.historyCount > 0 && coverage.withMaterialsCount < coverage.historyCount;

  const materialColumns: Column<ReportMaterialRow>[] = [
    {
      key: 'name',
      header: 'Vật tư',
      primary: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-text-primary">{row.name}</p>
          <p className="font-mono text-caption text-text-secondary">{row.code}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Loại', render: (row) => <TypeBadge type={row.type} /> },
    {
      key: 'quantity',
      header: 'Tổng số lượng',
      className: 'text-right tabular-nums',
      render: (row) => formatNumber(row.quantity, row.unit),
    },
    {
      key: 'cost',
      header: 'Thành tiền',
      className: 'text-right tabular-nums',
      render: (row) => <CostCell cost={row.cost} missingPrice={row.missingPrice} />,
    },
  ];

  const typeColumns: Column<TypeRow>[] = [
    { key: 'type', header: 'Loại vật tư', primary: true, render: (row) => <TypeBadge type={row.type} /> },
    {
      key: 'cost',
      header: 'Thành tiền',
      className: 'text-right tabular-nums',
      render: (row) => formatNumber(row.cost, 'đ'),
    },
  ];

  const blockColumns: Column<BlockRow>[] = [
    {
      key: 'block',
      header: 'Lô',
      primary: true,
      render: (row) => <span className="font-semibold text-text-primary">Lô {row.block}</span>,
    },
    {
      key: 'activityCount',
      header: 'Lượt hoạt động',
      className: 'text-right tabular-nums',
      render: (row) => formatNumber(row.activityCount),
    },
    {
      key: 'cost',
      header: 'Thành tiền',
      className: 'text-right tabular-nums',
      render: (row) => formatNumber(row.cost, 'đ'),
    },
  ];

  const tableEmpty = (
    <p className="rounded-lg border border-dashed border-border p-4 text-center text-body-sm text-text-secondary">
      Không có vật tư nào được ghi trong kỳ.
    </p>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Báo cáo tổng hợp"
        description="Vật tư đã dùng và chi phí theo khoảng thời gian. Chi phí chỉ tính từ khi bắt đầu ghi vật tư trong form cập nhật."
        breadcrumbs={[{ label: 'Tổng quan', to: ROUTES.dashboard }, { label: 'Báo cáo' }]}
        action={
          <Button
            variant="secondary"
            leftIcon={<Download className="size-5" />}
            loading={exporting}
            disabled={!!rangeError || !data}
            onClick={exportCsv}
          >
            Xuất CSV
          </Button>
        }
      />

      <Tabs
        label="Khoảng thời gian"
        items={RANGE_PRESETS}
        value={preset}
        onChange={selectPreset}
        className="mb-4"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        {preset === 'custom' ? (
          <>
            <Input
              label="Từ ngày"
              type="date"
              value={from}
              max={to}
              onChange={(event) => updateParams({ from: event.target.value })}
              containerClassName="sm:w-44"
            />
            <Input
              label="Đến ngày"
              type="date"
              value={to}
              min={from}
              error={rangeError}
              onChange={(event) => updateParams({ to: event.target.value })}
              containerClassName="sm:w-44"
            />
          </>
        ) : (
          <p className="self-center text-body-sm text-text-secondary sm:mr-auto">
            {formatDate(from)} – {formatDate(to)}
          </p>
        )}
        <Select
          label="Lô"
          placeholder="Tất cả lô"
          options={blockOptions}
          value={block}
          onChange={(event) => updateParams({ block: event.target.value })}
          containerClassName="sm:w-40"
        />
        <Select
          label="Loại vật tư"
          placeholder="Tất cả loại"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(event) => updateParams({ type: event.target.value })}
          containerClassName="sm:w-48"
        />
      </div>

      {rangeError ? (
        <EmptyState
          icon={BarChart3}
          title="Khoảng thời gian chưa hợp lệ"
          description="Chọn ngày kết thúc sau ngày bắt đầu để xem báo cáo."
        />
      ) : (
        <StateBoundary
          isLoading={query.isPending}
          error={query.error}
          isEmpty={!data || data.coverage.historyCount === 0}
          onRetry={() => query.refetch()}
          skeleton={
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          }
          empty={
            <EmptyState
              icon={BarChart3}
              title="Không có hoạt động nào trong khoảng đã chọn"
              description="Thử chọn khoảng thời gian dài hơn hoặc bỏ bớt bộ lọc lô."
            />
          }
        >
          {data && (
            <div className="flex flex-col gap-6">
              {/* Bắt buộc khi số liệu thiếu — không để người dùng tin số thiếu là số đủ (04_API §2c) */}
              {missingCoverage && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-warning bg-warning-subtle p-4 text-body-sm text-text-primary"
                >
                  <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
                  <p>
                    <strong>
                      {data.coverage.withMaterialsCount}/{data.coverage.historyCount}
                    </strong>{' '}
                    bản ghi trong kỳ có ghi vật tư — chi phí thực tế có thể cao hơn.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ReportStat label="Tổng chi phí" value={formatNumber(data.totalCost, 'đ')} icon={Wallet} />
                <ReportStat
                  label="Lượt hoạt động"
                  value={formatNumber(data.coverage.historyCount)}
                  icon={ClipboardList}
                />
                <ReportStat
                  label="Loại vật tư đã dùng"
                  value={formatNumber(data.byMaterial.length)}
                  icon={Layers}
                />
              </div>

              <section className="flex flex-col gap-3">
                <h2 className="text-h4 font-bold text-text-primary">Theo vật tư</h2>
                <Table
                  caption="Vật tư đã dùng trong kỳ, sắp theo thành tiền"
                  columns={materialColumns}
                  data={data.byMaterial}
                  rowKey={(row) => row.materialId}
                  emptyState={tableEmpty}
                />
              </section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="flex flex-col gap-3">
                  <h2 className="text-h4 font-bold text-text-primary">Theo loại vật tư</h2>
                  <Table
                    caption="Chi phí theo loại vật tư"
                    columns={typeColumns}
                    data={data.byType}
                    rowKey={(row) => row.type}
                    emptyState={tableEmpty}
                  />
                </section>
                <section className="flex flex-col gap-3">
                  <h2 className="text-h4 font-bold text-text-primary">Theo lô</h2>
                  <Table
                    caption="Chi phí và lượt hoạt động theo lô"
                    columns={blockColumns}
                    data={data.byBlock}
                    rowKey={(row) => row.block}
                    emptyState={tableEmpty}
                  />
                </section>
              </div>

              <Card>
                <Card.Header className="mb-3">
                  <Card.Title>Lượt hoạt động theo loại</Card.Title>
                </Card.Header>
                <ul className="flex flex-wrap gap-2">
                  {data.byActivity.map((row) => {
                    const config = ACTIVITY_CONFIG[row.type];
                    const Icon = config?.icon;
                    return (
                      <li
                        key={row.type}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-body-sm"
                      >
                        {Icon && <Icon aria-hidden className="size-4 text-text-secondary" />}
                        <span className="text-text-primary">{config?.label ?? row.type}</span>
                        <span className="font-bold tabular-nums text-text-primary">{row.count}</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          )}
        </StateBoundary>
      )}
    </PageContainer>
  );
}
