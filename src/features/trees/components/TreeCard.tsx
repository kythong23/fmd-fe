import { Link } from 'react-router';
import { ChevronRight, ImageOff, CalendarDays, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthScore } from '@/components/shared/HealthScore';
import { ROUTES } from '@/constants/routes';
import { EMPTY_VALUE, formatDate, yearsSince } from '@/utils/date';
import type { Tree } from '@/types';

/** Card cây dùng chung cho mọi grid danh sách cây (05_FRONTEND §18) */
export function TreeCard({ tree }: { tree: Tree }) {
  const age = yearsSince(tree.plantedDate);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-colors hover:border-border-strong">
      <div className="relative aspect-[16/10] w-full bg-surface-sunken">
        {tree.image ? (
          <img
            src={tree.image}
            alt={'Ảnh cây ' + tree.code}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-text-muted">
            <ImageOff aria-hidden className="size-6" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={tree.status} />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="font-mono text-h4 font-bold text-white">{tree.code}</p>
          <p className="text-caption text-white/80">{tree.variety}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border p-2">
            <dt className="text-caption text-text-muted">Tuổi cây</dt>
            <dd className="text-body-sm font-semibold text-text-primary">
              {age === null ? EMPTY_VALUE : age + ' năm'}
            </dd>
          </div>
          <div className="rounded-md border border-border p-2">
            <dt className="text-caption text-text-muted">Health Score</dt>
            <dd className="text-body-sm">
              <HealthScore score={tree.healthScore} />
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-1 text-caption text-text-secondary">
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden className="size-4 shrink-0 text-text-muted" />
            Lô {tree.location.block} — Hàng {tree.location.row} — Vị trí {tree.location.position}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 shrink-0 text-text-muted" />
            Cập nhật: {formatDate(tree.lastUpdated)}
          </span>
        </div>

        <Link
          to={ROUTES.tree(tree.code)}
          className="mt-auto flex min-h-11 items-center justify-center gap-1 rounded-md bg-primary-subtle px-3 text-body-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Xem chi tiết
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
    </article>
  );
}
