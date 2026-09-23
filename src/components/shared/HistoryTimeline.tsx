import { Fragment } from 'react';
import { Calendar, Clock, Package } from 'lucide-react';
import { Avatar, Badge, Card } from '@/components/ui';
import { DateText } from '@/components/shared/DateText';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ACTIVITY_CONFIG, ACTIVITY_STYLE, PART_TAG_LABEL } from '@/constants/activity-types';
import { formatDate } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { HistoryRecord, MaterialUsageEntry } from '@/types';

export interface HistoryTimelineProps {
  records: HistoryRecord[];
  /** Feed toàn vườn hiện thêm mã cây và cho bấm sang hồ sơ cây */
  onTreeClick?: (code: string) => void;
}

interface DayGroup {
  date: string;
  isToday: boolean;
  records: HistoryRecord[];
}

const TIME_FMT = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : TIME_FMT.format(d);
}

function groupByDay(records: HistoryRecord[]): DayGroup[] {
  const today = formatDate(new Date().toISOString());
  const groups: DayGroup[] = [];

  for (const record of records) {
    const date = formatDate(record.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.records.push(record);
    } else {
      groups.push({ date, isToday: date === today, records: [record] });
    }
  }

  return groups;
}

/** Đường timeline nối liên tục giữa các mốc — nửa dưới hàng này nối nửa trên hàng kế (05_FRONTEND) */
function TimelineRail({ isFirst, isLast }: { isFirst: boolean; isLast: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute left-1/2 w-px -translate-x-1/2 bg-border',
        isFirst ? 'top-1/2' : 'top-0',
        isLast ? 'bottom-1/2' : 'bottom-0',
      )}
    />
  );
}

/** Dùng chung cho lịch sử 1 cây và nhật ký toàn vườn — 1 implementation duy nhất */
export function HistoryTimeline({ records, onTreeClick }: HistoryTimelineProps) {
  // BE cắt hẳn unitPrice với worker/viewer — cùng cách kiểm tra như /materials (D9)
  const showPrice = records.some((record) => record.materials.some((item) => item.unitPrice !== undefined));
  const groups = groupByDay(records);

  // Vị trí hàng trong toàn bộ list (kể cả header ngày) để bo đầu/cuối đường timeline
  let rowIndex = -1;
  const totalRows = groups.reduce((sum, group) => sum + 1 + group.records.length, 0);

  return (
    <div className="grid grid-cols-[minmax(72px,96px)_2rem_1fr] gap-x-3">
      {groups.map((group) => {
        rowIndex += 1;
        const headerIndex = rowIndex;

        return (
          <Fragment key={group.date}>
            <div className="flex items-start justify-end pt-1">
              <Badge variant={group.isToday ? 'primary' : 'neutral'} size="sm">
                {group.isToday ? 'HÔM NAY' : 'MỐC NGÀY'}
              </Badge>
            </div>
            <div className="relative flex justify-center">
              <TimelineRail isFirst={headerIndex === 0} isLast={headerIndex === totalRows - 1} />
              <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-primary text-primary-fg">
                <Calendar className="size-4" aria-hidden />
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pb-3 pt-1">
              <h3 className="text-h4 font-bold text-text-primary">Ngày {group.date}</h3>
              <Badge variant="neutral" size="sm" icon={<Clock className="size-3.5" aria-hidden />}>
                {group.records.length} hoạt động trong ngày
              </Badge>
            </div>

            {group.records.map((record) => {
              rowIndex += 1;
              const rowIsLast = rowIndex === totalRows - 1;
              const config = ACTIVITY_CONFIG[record.type] ?? ACTIVITY_CONFIG.health_check;
              const style = ACTIVITY_STYLE[record.type] ?? ACTIVITY_STYLE.health_check;
              const Icon = config.icon;
              const measurements = record.measurements ?? {};
              // Cả 4 ô đều trống thì ẩn luôn lưới đo — tránh 4 ô "–" lấn át thông tin chính
              const hasMeasurements = Object.values(measurements).some(
                (value) => value !== null && value !== undefined,
              );
              const totalCost = showPrice
                ? record.materials.reduce(
                    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
                    0,
                  )
                : 0;

              return (
                <Fragment key={record.id}>
                  <div className="flex items-start justify-end pt-1">
                    <div className="flex w-fit flex-col items-center gap-0.5 rounded-md border border-border bg-surface px-2 py-1.5">
                      <span className="flex items-center gap-1 text-caption font-bold text-text-primary">
                        <Clock className="size-3" aria-hidden />
                        {formatTime(record.occurredAt)}
                      </span>
                      <span className="text-[10px] font-medium text-text-muted">Khung giờ</span>
                    </div>
                  </div>
                  <div className="relative flex justify-center">
                    <TimelineRail isFirst={false} isLast={rowIsLast} />
                    <span
                      className={cn(
                        'relative z-10 mt-2 block size-3.5 rounded-full ring-2 ring-surface',
                        style.dot,
                      )}
                    />
                  </div>
                  <div className="pb-4">
                    <Card padding="sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              'flex size-10 shrink-0 items-center justify-center rounded-full',
                              style.icon,
                            )}
                          >
                            <Icon className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-body font-bold text-text-primary">
                                {record.activity}
                              </h4>
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
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-1.5">
                          <Avatar name={record.performer} size="sm" />
                          <div>
                            <p className="text-[10px] font-bold tracking-wide text-text-muted uppercase">
                              Thực hiện
                            </p>
                            <p className="text-body-sm font-bold text-text-primary">
                              {record.performer}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="mt-2 text-body-sm text-text-secondary">{record.description}</p>

                      {record.conditions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {record.conditions.map((tag) => (
                            <Badge key={tag} variant="neutral">
                              {PART_TAG_LABEL[tag]}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {(record.dosage || record.materials.length > 0) && (
                        <MaterialsBlock
                          materials={record.materials}
                          dosage={record.dosage}
                          totalCost={totalCost}
                        />
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

                      {hasMeasurements && (
                        <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
                          <Measure label="Chiều cao" value={formatNumber(measurements.height, 'm')} />
                          <Measure
                            label="Đường kính"
                            value={formatNumber(measurements.trunkDiameter, 'cm')}
                          />
                          <Measure
                            label="Độ ẩm đất"
                            value={formatNumber(measurements.soilMoisture, '%')}
                          />
                          <Measure label="Số trái" value={formatNumber(measurements.fruitCount)} />
                        </dl>
                      )}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-caption text-text-muted">
                        <span>
                          Đã ghi nhận lúc <DateText value={record.occurredAt} variant="datetime" />
                        </span>
                        <span className="font-mono">Bản ghi số: #{record.id}</span>
                      </div>
                    </Card>
                  </div>
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}

interface MaterialsBlockProps {
  materials: MaterialUsageEntry[];
  dosage: string | null;
  /** 0 khi user không được xem giá (worker/viewer) — khi đó ẩn cả giá từng dòng */
  totalCost: number;
}

/** Vật tư là nội dung chính của bản ghi bón phân/phun thuốc — mỗi vật tư 1 chip, tổng tiền là số, không phải tag */
function MaterialsBlock({ materials, dosage, totalCost }: MaterialsBlockProps) {
  const showPrice = totalCost > 0;
  // 1 vật tư thì giá dòng trùng tổng — chỉ tách giá từng dòng khi có từ 2 vật tư
  const showLinePrice = showPrice && materials.length > 1;
  const hasMaterials = materials.length > 0;
  // Bản ghi cũ/tưới nước chỉ có liều lượng tự do — không gọi là "vật tư"
  const heading = hasMaterials ? 'Vật tư sử dụng' : 'Liều lượng';

  return (
    <section
      aria-label={heading}
      className="mt-3 w-full max-w-2xl rounded-md border border-border border-l-4 border-l-primary bg-surface px-3 py-2.5"
    >
      <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-text-muted uppercase">
        <Package className="size-3.5" aria-hidden />
        {heading}
      </p>

      {hasMaterials && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {materials.map((item) => (
            <li
              key={item.materialId}
              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-surface-sunken px-2 py-1 text-body-sm"
            >
              <span className="min-w-0 font-medium text-text-primary">{item.name}</span>
              <span aria-hidden className="text-text-muted">
                ·
              </span>
              <span className="font-semibold whitespace-nowrap text-text-primary tabular-nums">
                {formatNumber(item.quantity, item.unit)}
              </span>
              {showLinePrice && item.unitPrice !== undefined && (
                <span className="text-caption whitespace-nowrap text-text-secondary tabular-nums">
                  ({formatNumber(item.unitPrice * item.quantity, 'đ')})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {dosage &&
        (hasMaterials ? (
          <p className="mt-2 text-body-sm text-text-secondary">
            <span className="font-semibold text-text-primary">Liều lượng: </span>
            {dosage}
          </p>
        ) : (
          <p className="mt-1 text-body-sm font-medium text-text-primary">{dosage}</p>
        ))}

      {showPrice && (
        <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-dashed border-border pt-2">
          <span className="text-caption text-text-muted">Tổng chi phí</span>
          <span className="text-body font-bold text-text-primary tabular-nums">
            {formatNumber(totalCost, 'đ')}
          </span>
        </div>
      )}
    </section>
  );
}

function Measure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-sunken px-2 py-1.5">
      <dt className="text-caption text-text-muted">{label}</dt>
      <dd className="font-mono text-body-sm font-bold text-text-primary">{value}</dd>
    </div>
  );
}
