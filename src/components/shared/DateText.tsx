import { formatDate, formatDateTime, formatRelative } from '@/utils/date';

export interface DateTextProps {
  value: string | null | undefined;
  variant?: 'date' | 'datetime' | 'relative';
  className?: string;
}

/** Mọi hiển thị thời gian đi qua đây → luôn có <time datetime> đúng ISO */
export function DateText({ value, variant = 'datetime', className }: DateTextProps) {
  const text =
    variant === 'date'
      ? formatDate(value)
      : variant === 'relative'
        ? formatRelative(value)
        : formatDateTime(value);

  if (!value) return <span className={className}>{text}</span>;

  return (
    <time dateTime={value} title={formatDateTime(value)} className={className}>
      {text}
    </time>
  );
}
