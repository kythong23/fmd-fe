import type { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthScore } from '@/components/shared/HealthScore';
import { DateText } from '@/components/shared/DateText';
import { EMPTY_VALUE, yearsSince } from '@/utils/date';
import { formatBool, formatNumber, formatText } from '@/utils/format';
import { FRUIT_CONDITION_LABEL, LEAF_CONDITION_LABEL } from '@/constants/status-config';
import type { Tree } from '@/types';

/** Field thiếu hiện "—", không bao giờ undefined/NaN (05_FRONTEND §8) */
function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption text-text-muted">{label}</dt>
      <dd className="text-body-sm font-medium text-text-primary">{value}</dd>
    </div>
  );
}

export function TreePassportCard({ tree }: { tree: Tree }) {
  const age = yearsSince(tree.plantedDate);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-h1 font-extrabold tracking-tight text-text-primary">
              {tree.code}
            </p>
            <p className="mt-1 text-body text-text-secondary">
              {formatText(tree.variety)} — {age === null ? EMPTY_VALUE : age + ' năm tuổi'}
            </p>
            <div className="mt-3">
              <StatusBadge status={tree.status} size="md" />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <HealthScore score={tree.healthScore} variant="block" />
          </div>
        </div>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Thông tin cây</Card.Title>
        </Card.Header>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Row label="Giống" value={formatText(tree.variety)} />
          <Row
            label="Ngày trồng"
            value={<DateText value={tree.plantedDate} variant="date" />}
          />
          <Row
            label="Lô"
            value={tree.location.block ? 'Lô ' + tree.location.block : EMPTY_VALUE}
          />
          <Row
            label="Hàng / vị trí"
            value={formatText(tree.location.row) + ' / ' + formatText(tree.location.position)}
          />
          <Row label="Liếp" value={formatText(tree.location.bedName)} />
          <Row label="Mô" value={formatText(tree.location.moundNumber)} />
          <Row
            label="Tọa độ"
            value={
              tree.location.coordinates
                ? tree.location.coordinates.lat.toFixed(6) +
                  ', ' +
                  tree.location.coordinates.lng.toFixed(6)
                : EMPTY_VALUE
            }
          />
          <Row label="Độ ẩm đất" value={formatNumber(tree.soilMoisture, '%')} />
          <Row
            label="Tình trạng lá"
            value={tree.leafCondition ? LEAF_CONDITION_LABEL[tree.leafCondition] : EMPTY_VALUE}
          />
          <Row label="Ra hoa" value={formatBool(tree.flowering)} />
          <Row
            label="Tình trạng trái"
            value={tree.fruitCondition ? FRUIT_CONDITION_LABEL[tree.fruitCondition] : EMPTY_VALUE}
          />
          <Row label="Số trái" value={formatNumber(tree.fruitCount, 'trái')} />
          <Row label="Chiều cao" value={formatNumber(tree.heightMeters, 'm')} />
          <Row label="Đường kính thân" value={formatNumber(tree.trunkDiameterCm, 'cm')} />
          <Row label="Người cập nhật" value={formatText(tree.lastUpdatedBy)} />
        </dl>
        <p className="mt-4 border-t border-border pt-3 text-caption text-text-muted">
          Cập nhật lần cuối: <DateText value={tree.lastUpdated} variant="relative" />
        </p>
      </Card>
    </div>
  );
}
