import { Badge } from '@/components/ui';
import { STATUS_CONFIG } from '@/constants/status-config';
import type { TreeStatus } from '@/types';

export interface StatusBadgeProps {
  status: TreeStatus;
  size?: 'sm' | 'md';
}

/** Một implementation duy nhất cho badge trạng thái toàn app (05_FRONTEND §18) */
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.badge} size={size} icon={<Icon className="size-4" />}>
      {config.label}
    </Badge>
  );
}
