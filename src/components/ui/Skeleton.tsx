import { cn } from '@/utils/cn';

export interface SkeletonProps {
  className?: string;
}

/** Skeleton phải đúng hình dạng nội dung — cấm màn hình trắng (05_FRONTEND §8) */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-md bg-surface-sunken',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-surface after:to-transparent after:content-[""]',
        'after:animate-[shimmer_1.6s_infinite]',
        className,
      )}
    />
  );
}
