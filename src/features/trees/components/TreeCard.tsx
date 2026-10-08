import { useState } from 'react';
import { Link } from 'react-router';
import { Activity, ChevronRight, MapPin, QrCode, Sprout, TreeDeciduous } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { FRUIT_CONDITION_LABEL, STATUS_CONFIG } from '@/constants/status-config';
import { EMPTY_VALUE, yearsSince } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { healthTone } from '@/utils/health-score';
import { cn } from '@/utils/cn';
import type { Tree, TreeStatus } from '@/types';

const STATUS_TONE: Record<TreeStatus, { bar: string; text: string }> = {
  healthy: { bar: 'bg-success', text: 'text-success' },
  monitoring: { bar: 'bg-warning', text: 'text-warning' },
  problem: { bar: 'bg-error', text: 'text-error' },
  unknown: { bar: 'bg-neutral', text: 'text-text-muted' },
};

const HEALTH_TONE = {
  success: { bar: 'bg-success', text: 'text-success' },
  warning: { bar: 'bg-warning', text: 'text-warning' },
  error: { bar: 'bg-error', text: 'text-error' },
} as const;

/** Giai đoạn hiện tại của cây — hiện trên ảnh; null = không có dữ liệu thì ẩn */
function growthStage(tree: Tree): string | null {
  if (tree.fruitCondition && tree.fruitCondition !== 'none')
    return FRUIT_CONDITION_LABEL[tree.fruitCondition];
  if (tree.floweringStage) return tree.floweringStage;
  return tree.flowering ? 'Đang ra hoa' : null;
}

/** Đơn vị viết liền số (5.4m, 69%) cho dòng phụ gọn; null -> "—" */
function withUnit(value: number | null, unit: string): string {
  return value === null ? EMPTY_VALUE : formatNumber(value) + unit;
}

/** Card cây dùng chung cho mọi grid danh sách cây (05_FRONTEND §18) */
export function TreeCard({ tree }: { tree: Tree }) {
  const [broken, setBroken] = useState(false);
  const age = yearsSince(tree.plantedDate);
  const plantedYear = tree.plantedDate ? new Date(tree.plantedDate).getFullYear() : null;
  const status = STATUS_CONFIG[tree.status];
  const StatusIcon = status.icon;
  const stage = growthStage(tree);
  const health = Math.max(0, Math.min(100, Math.round(tree.healthScore)));
  const healthStyle = HEALTH_TONE[healthTone(health)];

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-colors hover:border-border-strong">
      <div aria-hidden className={cn('h-1.5 w-full', STATUS_TONE[tree.status].bar)} />

      <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-2 truncate">
            <span className="font-mono text-h4 font-bold text-text-primary">{tree.code}</span>
            <span aria-hidden className="text-text-muted">
              /
            </span>
            <span className="truncate text-body-sm font-medium text-primary">{tree.variety}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-caption text-text-secondary">
            <MapPin aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="truncate">
              Lô {tree.location.block} · Hàng {tree.location.row} · Vị trí {tree.location.position}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              'flex items-center gap-1 text-body-sm font-medium',
              STATUS_TONE[tree.status].text,
            )}
          >
            <StatusIcon aria-hidden className="size-4" />
            {status.label}
          </span>
          {plantedYear && <span className="text-caption text-text-muted">Trồng {plantedYear}</span>}
        </div>
      </header>

      <div className="relative aspect-[2/1] w-full bg-surface-sunken">
        {/* Chưa có ảnh (hoặc ảnh lỗi) -> icon mẫu giống popup thông tin cây */}
        {tree.image && !broken ? (
          <img
            src={tree.image}
            alt={'Ảnh cây ' + tree.code}
            loading="lazy"
            onError={() => setBroken(true)}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-text-muted">
            <TreeDeciduous aria-hidden className="size-10" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
          {stage ? (
            <span className="flex min-w-0 items-center gap-1.5 text-body-sm font-medium text-white">
              <Sprout aria-hidden className="size-4 shrink-0 text-success" />
              <span className="truncate">{stage}</span>
            </span>
          ) : (
            <span />
          )}
          <Link
            to={ROUTES.qr + '?q=' + encodeURIComponent(tree.code)}
            aria-label={'Mã QR của cây ' + tree.code}
            className="flex shrink-0 items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-caption font-semibold text-white transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <QrCode aria-hidden className="size-3.5" />
            QR
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <dl className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <dt className="text-caption text-text-muted">Tuổi cây &amp; Sản lượng</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="text-h4 font-bold text-text-primary">
                {age === null ? EMPTY_VALUE : age + ' năm'}
              </span>
              {tree.fruitCount !== null && (
                <span className="text-body-sm text-text-secondary">
                  {formatNumber(tree.fruitCount)} trái
                </span>
              )}
            </dd>
            <dd className="mt-1 text-caption text-text-muted">
              Tán {withUnit(tree.canopyRadius, 'm')} · Ẩm {withUnit(tree.soilMoisture, '%')}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="flex items-center justify-between text-caption text-text-muted">
              Health Score
              <Activity aria-hidden className="size-4" />
            </dt>
            <dd className="mt-1">
              <span className={cn('font-mono text-h4 font-bold', healthStyle.text)}>{health}</span>
              <span className="font-mono text-caption text-text-muted"> /100</span>
            </dd>
            <dd
              role="meter"
              aria-valuenow={health}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Điểm sức khỏe cây"
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
            >
              <div
                className={cn('h-full rounded-full', healthStyle.bar)}
                style={{ width: health + '%' }}
              />
            </dd>
          </div>
        </dl>

        <Link
          to={ROUTES.tree(tree.code)}
          className="mt-auto flex min-h-11 items-center justify-center gap-1 rounded-md bg-primary-subtle px-3 text-body-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Xem chi tiết cây
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
    </article>
  );
}
