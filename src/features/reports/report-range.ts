export type RangePreset = 'month' | 'quarter' | 'year' | 'custom';

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: 'month', label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year', label: 'Năm nay' },
  { value: 'custom', label: 'Tuỳ chọn' },
];

/** yyyy-mm-dd theo giờ máy — không dùng toISOString (lệch ngày do UTC) */
export function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isDateInput(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/** Khoảng ngày **bao gồm cả hai đầu** để hiển thị trên input */
export function presetRange(preset: Exclude<RangePreset, 'custom'>, today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const [start, end] =
    preset === 'month'
      ? [new Date(year, month, 1), new Date(year, month + 1, 0)]
      : preset === 'quarter'
        ? [new Date(year, month - (month % 3), 1), new Date(year, month - (month % 3) + 3, 0)]
        : [new Date(year, 0, 1), new Date(year, 11, 31)];
  return { from: toDateInput(start), to: toDateInput(end) };
}

/** API nhận `to` exclusive (04_API §2c) → ngày cuối người dùng chọn + 1 */
export function toExclusive(inclusiveTo: string): string {
  const [y, m, d] = inclusiveTo.split('-').map(Number);
  return toDateInput(new Date(y, m - 1, d + 1));
}
