import { Badge, Card } from '@/components/ui';
import { DateText } from '@/components/shared/DateText';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ACTIVITY_CONFIG } from '@/constants/activity-types';
import { PART_TAG_LABEL } from '@/constants/activity-types';
import { formatNumber } from '@/utils/format';
import type { HistoryRecord } from '@/types';

export interface HistoryTimelineProps {
  records: HistoryRecord[];
  /** Feed toàn vườn hiện thêm mã cây và cho bấm sang hồ sơ cây */
  onTreeClick?: (code: string) => void;
}

/** Dùng chung cho lịch sử 1 cây và nhật ký toàn vườn — 1 implementation duy nhất */
export function HistoryTimeline({ records, onTreeClick }: HistoryTimelineProps) {
  return (
    <ol className="flex flex-col gap-3">
      {records.map((record) => {
        const config = ACTIVITY_CONFIG[record.type] ?? ACTIVITY_CONFIG.health_check;
        const Icon = config.icon;
        const measurements = record.measurements ?? {};

        return (
          <li key={record.id}>
            <Card padding="sm">
              <div className="flex gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-hover"
                >
                  <Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-body font-bold text-text-primary">{record.activity}</h3>
                    {record.status && <StatusBadge status={record.status} />}
                    {onTreeClick && (
                      <button
                        type="button"
                        onClick={() => onTreeClick(record.treeCode)}
                        className="rounded-sm font-mono text-body-sm font-bold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                      >
                        {record.treeCode}
                      </button>
                    )}
                  </div>

                  <p className="mt-1 text-body-sm text-text-secondary">{record.description}</p>

                  {record.conditions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {record.conditions.map((tag) => (
                        <Badge key={tag} variant="neutral">
                          {PART_TAG_LABEL[tag]}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {record.dosage && (
                    <p className="mt-2 text-caption text-text-secondary">
                      Liều lượng: {record.dosage}
                    </p>
                  )}

                  {record.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {record.images.map((url, index) => (
                        <img
                          key={url.slice(0, 64) + index}
                          src={url}
                          alt={'Ảnh ghi nhận ' + (index + 1) + ' của cây ' + record.treeCode}
                          width={80}
                          height={80}
                          loading="lazy"
                          className="size-20 rounded-md border border-border object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-text-muted">
                    <Measure label="Cao" value={formatNumber(measurements.height, 'm')} />
                    <Measure
                      label="Đường kính"
                      value={formatNumber(measurements.trunkDiameter, 'cm')}
                    />
                    <Measure label="Ẩm đất" value={formatNumber(measurements.soilMoisture, '%')} />
                    <Measure label="Số trái" value={formatNumber(measurements.fruitCount)} />
                  </dl>

                  <p className="mt-2 flex flex-wrap items-center gap-2 text-caption text-text-muted">
                    <DateText value={record.occurredAt} />
                    <span aria-hidden>•</span>
                    <span>{record.performer}</span>
                  </p>
                </div>
              </div>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

function Measure({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex gap-1">
      <dt>{label}:</dt>
      <dd className="font-mono text-text-secondary">{value}</dd>
    </span>
  );
}
