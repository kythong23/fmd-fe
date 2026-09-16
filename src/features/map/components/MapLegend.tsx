import durianTreeImg from '@/assets/durian-tree.png';
import { STATUS_CONFIG, TREE_STATUSES } from '@/constants/status-config';

/** Legend bắt buộc: màu + hình dạng ↔ trạng thái (05_FRONTEND §6.7) */
export function MapLegend() {
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-4 border-t border-border pt-3">
      {TREE_STATUSES.map((status) => {
        const config = STATUS_CONFIG[status];
        return (
          <li key={status} className="flex items-center gap-2 text-caption text-text-secondary">
            {/* Thu nhỏ mô phỏng cây sầu riêng với viền trạng thái */}
            <span
              className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-surface-sunken shadow-xs"
              style={{ borderColor: config.colorVar }}
            >
              <img
                src={durianTreeImg}
                alt=""
                className="size-full scale-110 object-cover"
              />
            </span>
            {config.label}
          </li>
        );
      })}
      <li className="flex items-center gap-2 text-caption text-text-secondary">
        <span className="relative flex h-3 w-7 items-center justify-center rounded-xs bg-[#475569] border border-[#334155]">
          <span className="h-0.5 w-3.5 border-t border-dashed border-[#fef08a]" />
        </span>
        Đường giao thông
      </li>
    </ul>
  );
}
