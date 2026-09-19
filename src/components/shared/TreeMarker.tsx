import { memo } from 'react';
import durianTreeImg from '@/assets/durian-tree.png';
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

/**
 * Biểu tượng cây sầu riêng chi tiết nhìn từ trên xuống (Top-down Durian Tree)
 * - Tán lá xoè tròn dày với từng cụm lá xanh đậm & chồi non sáng màu
 * - Thân cành gỗ trung tâm vươn toả ra các hướng
 * - Các quả sầu riêng gai vàng sai trĩu bám trên các nhánh cành
 * - Đổ bóng đất tự nhiên & vòng trạng thái (Khỏe mạnh, Cần theo dõi, Có vấn đề)
 */
export const TreeMarker = memo(function TreeMarker({
  code,
  status,
  point,
  size = 6, // Bán kính tán cây: 16px (đường kính 32px, thu nhỏ gọn gàng, thoáng luống)
  selected = false,
  onSelect,
}: TreeMarkerProps) {
  const config = STATUS_CONFIG[status];
  const label = 'Cây ' + code + ' — ' + config.label;
  const { x, y } = point;
  const r = size;

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
      className={`tree-marker transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        selected ? 'scale-112' : ''
      } ${onSelect ? 'cursor-pointer hover:scale-110' : ''}`}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      <title>{label}</title>

      {/* Vòng focus bàn phím (bo tròn, chỉ hiện khi :focus-visible) */}
      <circle
        className="tree-focus-ring pointer-events-none"
        cx={x}
        cy={y}
        r={r + 4}
        fill="none"
        stroke="var(--color-focus-ring)"
        strokeWidth={1.5}
      />

      {/* Highlight cây đang chọn: quầng sáng thở + 2 vòng sóng lan toả so le */}
      {selected && (
        <g className="pointer-events-none">
          <circle className="tree-glow" cx={x} cy={y} r={r + 4.5} fill="var(--color-primary)" />
          <circle
            className="tree-pulse"
            cx={x}
            cy={y}
            r={r + 2}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={1.6}
          />
          <circle
            className="tree-pulse-delayed"
            cx={x}
            cy={y}
            r={r + 2}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={1.2}
          />
        </g>
      )}

      {/* Đổ bóng tán cây tự nhiên xuống nền đất */}
      <ellipse
        cx={x + 1}
        cy={y + 2}
        rx={r + 1}
        ry={r * 0.95}
        fill="#090d16"
        opacity={0.28}
      />

      {/* Vòng viền trạng thái (Status halo) bám sát tán lá */}
      <circle
        cx={x}
        cy={y}
        r={r + 1.8}
        fill="none"
        stroke={config.colorVar}
        strokeWidth={selected ? 3 : 2}
        opacity={status === 'healthy' ? 0.85 : 1}
      />

      {/* Vòng phụ báo hiệu nhịp rung khi cây cần theo dõi hoặc có vấn đề */}
      {(status === 'problem' || status === 'monitoring') && (
        <circle
          cx={x}
          cy={y}
          r={r + 3.8}
          fill="none"
          stroke={config.colorVar}
          strokeWidth={1}
          strokeDasharray="2.5 1.5"
          opacity={0.75}
        />
      )}

      {/* Hình ảnh cây sầu riêng chi tiết nhìn từ trên xuống */}
      <image
        href={durianTreeImg}
        x={x - r}
        y={y - r}
        width={r * 2}
        height={r * 2}
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none select-none"
        style={
          status === 'problem'
            ? { filter: 'saturate(0.82) sepia(0.18)' }
            : undefined
        }
      />

      {/* Huy hiệu cảnh báo góc tán lá cho cây có vấn đề hoặc cần theo dõi */}
      {status === 'problem' && (
        <g transform={`translate(${x + r * 0.7}, ${y - r * 0.7})`}>
          <circle cx="0" cy="0" r="3.8" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
          <line x1="0" y1="-1.8" x2="0" y2="0.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          <circle cx="0" cy="1.8" r="0.5" fill="#ffffff" />
        </g>
      )}

      {status === 'monitoring' && (
        <g transform={`translate(${x + r * 0.7}, ${y - r * 0.7})`}>
          <circle cx="0" cy="0" r="3.6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          <line x1="0" y1="-1.8" x2="0" y2="0.4" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="0" cy="1.6" r="0.45" fill="#ffffff" />
        </g>
      )}

    </g>
  );
});
