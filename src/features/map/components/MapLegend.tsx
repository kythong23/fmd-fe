import { STATUS_CONFIG, TREE_STATUSES } from '@/constants/status-config';

/** Legend bắt buộc: màu + hình dạng ↔ trạng thái (05_FRONTEND §6.7) */
export function MapLegend() {
  return (
    <ul className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3">
      {TREE_STATUSES.map((status) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        return (
          <li key={status} className="flex items-center gap-2 text-caption text-text-secondary">
            <Icon aria-hidden className="size-4" style={{ color: config.colorVar }} />
            {config.label}
          </li>
        );
      })}
    </ul>
  );
}
