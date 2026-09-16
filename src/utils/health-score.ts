import { HEALTH_THRESHOLD } from '@/constants/status-config';
import type { TreeStatus } from '@/types';

/**
 * Heuristic của bản demo (04_API §2.4). Backend là nơi tính thật;
 * mock dùng đúng công thức này để khi nối API không lệch số.
 */
export function computeHealthScore(status: TreeStatus, current: number): number {
  switch (status) {
    case 'healthy':
      return Math.min(100, Math.max(88, current + 5));
    case 'monitoring':
      return Math.min(84, Math.max(70, current));
    case 'problem':
      return Math.min(65, Math.max(45, current - 15));
    default:
      return Math.min(100, Math.max(0, current));
  }
}

export function healthTone(score: number): 'success' | 'warning' | 'error' {
  if (score >= HEALTH_THRESHOLD.good) return 'success';
  if (score >= HEALTH_THRESHOLD.fair) return 'warning';
  return 'error';
}
