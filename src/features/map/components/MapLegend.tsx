import { STATUS_CONFIG, TREE_STATUSES } from '@/constants/status-config';

/** Legend bắt buộc: màu + hình dạng ↔ trạng thái (05_FRONTEND §6.7) */
export function MapLegend() {
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-4 border-t border-border pt-3">
      {TREE_STATUSES.map((status) => {
        const config = STATUS_CONFIG[status];
        return (
          <li key={status} className="flex items-center gap-2 text-caption text-text-secondary">
            {/* Chấm tán cây trên bản đồ vệ tinh + viền trạng thái */}
            <span
              className="flex size-4 shrink-0 rounded-full border-2 bg-[#2c4626]"
              style={{ borderColor: config.colorVar }}
            />
            {config.label}
          </li>
        );
      })}
      <li className="flex items-center gap-2 text-caption text-text-secondary">
        <span className="h-2 w-7 rounded-full bg-[#b2b6ae] ring-1 ring-[#8b9086]" />
        Đường giao thông
      </li>
    </ul>
  );
}
