import { EMPTY_VALUE } from './date';

// Nhóm nghìn bằng dấu phẩy, thập phân bằng dấu chấm — khớp với NumberInput và Input type="number" lúc nhập
const NUMBER_FMT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function formatNumber(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined || Number.isNaN(value)) return EMPTY_VALUE;
  const text = NUMBER_FMT.format(value);
  return unit ? `${text} ${unit}` : text;
}

export function formatText(value: string | null | undefined): string {
  return value && value.trim() ? value : EMPTY_VALUE;
}

export function formatBool(value: boolean | null | undefined, yes = 'Có', no = 'Không'): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return value ? yes : no;
}

/** Phần trăm an toàn — chặn chia cho 0 và kẹp 0–100 (05_FRONTEND §16) */
export function safePercent(part: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
}
