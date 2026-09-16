const DATE_FMT = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const DATETIME_FMT = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const EMPTY_VALUE = '—';

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Nơi DUY NHẤT format ngày — không gọi toLocaleDateString rải rác (05_FRONTEND §12) */
export function formatDate(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? DATE_FMT.format(d) : EMPTY_VALUE;
}

export function formatDateTime(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? DATETIME_FMT.format(d) : EMPTY_VALUE;
}

export function formatRelative(iso: string | null | undefined): string {
  const d = parse(iso);
  if (!d) return EMPTY_VALUE;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(iso);
}

export function daysSince(iso: string | null | undefined): number | null {
  const d = parse(iso);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

/** Tuổi cây tính từ plantedDate — không lưu sẵn để khỏi lệch (03_DATABASE §3) */
export function yearsSince(iso: string | null | undefined): number | null {
  const d = parse(iso);
  if (!d) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (365.25 * 86_400_000)));
}
