import { cn } from '@/utils/cn';
import { healthTone } from '@/utils/health-score';

export interface HealthScoreProps {
  score: number;
  variant?: 'inline' | 'block';
}

const TONE_TEXT = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
} as const;

const TONE_BAR = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
} as const;

const TONE_LABEL = {
  success: 'Tốt',
  warning: 'Trung bình',
  error: 'Thấp',
} as const;

/** healthScore do backend tính; FE chỉ hiển thị (05_FRONTEND §12) */
export function HealthScore({ score, variant = 'inline' }: HealthScoreProps) {
  const safe = Math.max(0, Math.min(100, Math.round(score)));
  const tone = healthTone(safe);

  if (variant === 'inline') {
    return (
      <span className={cn('font-mono font-bold', TONE_TEXT[tone])}>
        {safe}
        <span className="text-text-muted">/100</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn('text-display font-extrabold', TONE_TEXT[tone])}>{safe}</span>
        <span className="text-body-sm font-semibold text-text-secondary">{TONE_LABEL[tone]}</span>
      </div>
      <div
        role="meter"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Điểm sức khỏe cây"
        className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
      >
        <div className={cn('h-full rounded-full', TONE_BAR[tone])} style={{ width: safe + '%' }} />
      </div>
    </div>
  );
}
