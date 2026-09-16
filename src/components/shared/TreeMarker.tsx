import { memo } from 'react';
import { STATUS_CONFIG } from '@/constants/status-config';
import type { TreeStatus, XY } from '@/types';

export interface TreeMarkerProps {
  code: string;
  status: TreeStatus;
  point: XY;
  size?: number;
  selected?: boolean;
  onSelect?: (code: string) => void;
}

/** Hình dạng khác nhau theo trạng thái — không chỉ dựa vào màu (07 §5) */
function shapePath(shape: string, x: number, y: number, r: number): string {
  switch (shape) {
    case 'triangle':
      return `M ${x} ${y - r} L ${x + r} ${y + r} L ${x - r} ${y + r} Z`;
    case 'square':
      return `M ${x - r} ${y - r} H ${x + r} V ${y + r} H ${x - r} Z`;
    case 'diamond':
      return `M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`;
    default:
      return `M ${x} ${y - r} A ${r} ${r} 0 1 0 ${x} ${y + r} A ${r} ${r} 0 1 0 ${x} ${y - r} Z`;
  }
}

/** memo: hover 1 cây không re-render cả bản đồ (05_FRONTEND §15) */
export const TreeMarker = memo(function TreeMarker({
  code,
  status,
  point,
  size = 9,
  selected = false,
  onSelect,
}: TreeMarkerProps) {
  const config = STATUS_CONFIG[status];
  const label = 'Cây ' + code + ' — ' + config.label;

  return (
    <g
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? label : undefined}
      onClick={onSelect ? () => onSelect(code) : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(code);
              }
            }
          : undefined
      }
      className={onSelect ? 'cursor-pointer focus-visible:outline-none' : undefined}
    >
      <title>{label}</title>
      {selected && (
        <circle cx={point.x} cy={point.y} r={size + 7} fill="none" stroke="var(--color-primary)" strokeWidth={3} />
      )}
      <path
        d={shapePath(config.shape, point.x, point.y, size)}
        fill={config.colorVar}
        stroke="var(--color-surface)"
        strokeWidth={2}
      />
    </g>
  );
});
