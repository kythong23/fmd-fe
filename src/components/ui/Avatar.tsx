import { cn } from '@/utils/cn';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const last = parts[parts.length - 1];
  const first = parts.length > 1 ? parts[parts.length - 2] : '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-subtle font-bold text-primary-hover',
        size === 'sm' ? 'size-8 text-caption' : 'size-10 text-body-sm',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
