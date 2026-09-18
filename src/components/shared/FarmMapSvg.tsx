import { useMemo } from 'react';
import { latLngToXY } from '@/utils/geo';
import { TreeMarker } from './TreeMarker';
import type { MapLayers, Tree, XY } from '@/types';

export type MapLayerKey = 'boundary' | 'beds' | 'canals' | 'roads' | 'reservoir' | 'facilities' | 'trees';

export interface FarmMapSvgProps {
  layers: MapLayers;
  trees: Tree[];
  visible: Record<MapLayerKey, boolean>;
  viewBox?: string;
  selectedCode?: string | null;
  onSelectTree?: (code: string) => void;
  className?: string;
  markerSize?: number;
}

const toPoints = (points: XY[]) => points.map((point) => point.x + ',' + point.y).join(' ');

/**
 * Chuyển đổi mảng toạ độ thành SVG path uốn lượn mềm mại (Cubic Bézier Spline).
 * Tự động tính vector tiếp tuyến tại mỗi đỉnh và chuẩn hoá độ dài tay đòn
 * theo khoảng cách từng đoạn để đường cong tự nhiên, không bị phình (overshoot).
 */
export function pointsToSmoothPath(points: XY[], tension = 0.25): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  const n = points.length;
  // Vector tiếp tuyến đơn vị tại mỗi điểm
  const tangents: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const prev = i === 0 ? points[0] : points[i - 1];
    const next = i === n - 1 ? points[n - 1] : points[i + 1];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy);
    tangents.push(len > 0 ? { x: dx / len, y: dy / len } : { x: 0, y: 0 });
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const segDist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const handleLen = segDist * tension;

    const cp1x = p0.x + tangents[i].x * handleLen;
    const cp1y = p0.y + tangents[i].y * handleLen;
    const cp2x = p1.x - tangents[i + 1].x * handleLen;
    const cp2y = p1.y - tangents[i + 1].y * handleLen;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }

  return d;
}

/** SVG thuần — MVP chỉ render, chưa cần Konva/Fabric (05_FRONTEND §6.7) */
export function FarmMapSvg({
  layers,
  trees,
  visible,
  viewBox,
  selectedCode,
  onSelectTree,
  className,
  markerSize,
}: FarmMapSvgProps) {
  // lat/lng là nguồn chuẩn; pixel chỉ là lớp hiển thị dẫn xuất (09_DECISIONS D5)
  const points = useMemo(
    () =>
      trees
        .map((tree) => {
          const xy =
            tree.location.mapPoint ??
            (tree.location.coordinates ? latLngToXY(tree.location.coordinates, layers.anchors) : null);
          return xy ? { tree, xy } : null;
        })
        .filter((item): item is { tree: Tree; xy: XY } => item !== null),
    [trees, layers.anchors],
  );

  const box = viewBox ?? '0 0 ' + layers.viewBox.width + ' ' + layers.viewBox.height;

  return (
    <svg
      viewBox={box}
      role="img"
      aria-label="Bản đồ vườn với vị trí từng cây"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="0" y="0" width={layers.viewBox.width} height={layers.viewBox.height} fill="var(--color-surface-sunken)" />

      {/* Lớp đường giao thông: vẽ 3 lượt (lớp nền lề đường -> lớp thảm nhựa -> tim đường) uốn cong mềm mại */}
      {visible.roads && (
        <g id="roads-network">
          {/* Lượt 1: Lề đường / móng đường xám sẫm (vẽ tất cả các nhánh để tự động hòa hợp tại ngã 3, ngã 4) */}
          {layers.roads.map((road) => (
            <path
              key={'subbase-' + road.id}
              d={pointsToSmoothPath(road.points)}
              fill="none"
              stroke="#334155"
              strokeWidth={road.width + 3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Lượt 2: Mặt đường nhựa asphalts xám hiện đại (#475569 / #3f4e65) */}
          {layers.roads.map((road) => (
            <path
              key={'surface-' + road.id}
              d={pointsToSmoothPath(road.points)}
              fill="none"
              stroke={road.color ?? '#475569'}
              strokeWidth={road.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Lượt 3: Vạch kẻ tim đường màu trắng / vàng đứt nét chuẩn giao thông */}
          {layers.roads.map((road) => (
            <path
              key={'marking-' + road.id}
              d={pointsToSmoothPath(road.points)}
              fill="none"
              stroke="#fef08a"
              strokeWidth={1.8}
              strokeDasharray="10 8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          ))}
        </g>
      )}

      {visible.boundary && (
        <polygon
          points={toPoints(layers.boundary.points)}
          fill="rgba(244, 114, 182, 0.12)"
          stroke="#10b981"
          strokeWidth={4}
          strokeLinejoin="round"
        />
      )}

      {visible.beds &&
        layers.beds.map((bed) => (
          <polygon
            key={bed.id}
            points={toPoints(bed.points)}
            fill="var(--color-primary-subtle)"
            stroke="var(--color-primary)"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

      {visible.canals &&
        layers.canals.map((canal) => (
          <polyline
            key={canal.id}
            points={toPoints(canal.points)}
            fill="none"
            stroke="var(--color-info)"
            strokeWidth={canal.width}
            strokeLinecap="round"
            opacity={0.6}
          />
        ))}


      {visible.reservoir && layers.reservoir && (
        <polygon
          points={toPoints(layers.reservoir.points)}
          fill="var(--color-info-subtle)"
          stroke="var(--color-info)"
          strokeWidth={2}
        />
      )}

      {visible.facilities &&
        layers.facilities.map((facility) => {
          if (facility.width && facility.height) {
            const w = facility.width;
            const h = facility.height;
            const x = facility.position.x - w / 2;
            const y = facility.position.y - h / 2;
            const rot = facility.rotation ?? 0;
            return (
              <g
                key={facility.id}
                transform={rot ? `rotate(${rot}, ${facility.position.x}, ${facility.position.y})` : undefined}
                className="facility-building"
              >
                {/* Bóng đổ khối nhà */}
                <rect
                  x={x + 4}
                  y={y + 5}
                  width={w}
                  height={h}
                  rx={3}
                  fill="rgba(15, 23, 42, 0.3)"
                />
                {/* Khối nhà chính (mái tôn sáng màu theo ảnh vệ tinh) */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={2}
                  fill="#e2e8f0"
                  stroke="#64748b"
                  strokeWidth={1.8}
                />
                {/* Mái hiên / viền mái */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={w - 4}
                  height={h - 4}
                  fill="#f8fafc"
                />
                {/* Đường sống mái (đỉnh nóc) */}
                <line
                  x1={x + 6}
                  y1={facility.position.y}
                  x2={x + w - 6}
                  y2={facility.position.y}
                  stroke="#94a3b8"
                  strokeWidth={1.6}
                />
                {/* Khối hông mái chéo */}
                <polygon
                  points={`${x},${y} ${x + 6},${facility.position.y} ${x},${y + h}`}
                  fill="rgba(100, 116, 139, 0.12)"
                />
                <polygon
                  points={`${x + w},${y} ${x + w - 6},${facility.position.y} ${x + w},${y + h}`}
                  fill="rgba(100, 116, 139, 0.12)"
                />
                {/* Nhãn công trình nổi bật */}
                <g transform={`translate(${facility.position.x}, ${y - 10})`}>
                  <rect
                    x={-(facility.label.length * 4.2 + 8)}
                    y={-14}
                    width={facility.label.length * 8.4 + 16}
                    height={18}
                    rx={4}
                    fill="rgba(15, 23, 42, 0.88)"
                    stroke="#38bdf8"
                    strokeWidth={0.8}
                  />
                  <text
                    x={0}
                    y={-1}
                    textAnchor="middle"
                    fontSize={10.5}
                    fontWeight={600}
                    fill="#f8fafc"
                  >
                    {facility.label}
                  </text>
                </g>
              </g>
            );
          }
          return (
            <g key={facility.id} className="facility-point">
              <circle
                cx={facility.position.x}
                cy={facility.position.y}
                r={9}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={facility.position.x}
                y={facility.position.y + 22}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="#334155"
                paintOrder="stroke"
                stroke="#ffffff"
                strokeWidth={3}
                strokeLinejoin="round"
              >
                {facility.label}
              </text>
            </g>
          );
        })}

      {visible.trees &&
        points.map(({ tree, xy }) => (
          <TreeMarker
            key={tree.code}
            code={tree.code}
            status={tree.status}
            point={xy}
            size={markerSize}
            selected={selectedCode === tree.code}
            onSelect={onSelectTree}
          />
        ))}
    </svg>
  );
}
