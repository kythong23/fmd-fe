import { useMemo } from 'react';
import { latLngToXY } from '@/utils/geo';
import { TreeMarker } from './TreeMarker';
import type { MapLayers, Tree, XY } from '@/types';

export type MapLayerKey =
  | 'satellite'
  | 'whiteCanvas'
  | 'boundary'
  | 'beds'
  | 'canals'
  | 'roads'
  | 'reservoir'
  | 'facilities'
  | 'trees';

export interface FarmMapSvgProps {
  layers: MapLayers;
  trees: Tree[];
  visible: Record<MapLayerKey, boolean>;
  viewBox?: string;
  selectedCode?: string | null;
  onSelectTree?: (code: string) => void;
  className?: string;
  markerSize?: number;
  preserveAspectRatio?: string;
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

/**
 * Như pointsToSmoothPath nhưng hỗ trợ ngắt nét: chèn { x: NaN, y: NaN } vào mảng
 * để kết thúc một đoạn và vẽ tiếp từ điểm sau đó (nhiều subpath trong 1 <path>).
 */
// ponytail: dùng NaN làm sentinel để khỏi đổi type XY[]; đổi sang (XY | null)[] nếu cần rõ nghĩa hơn.
export function pointsToBrokenSmoothPath(points: XY[], tension = 0.25): string {
  const segments: XY[][] = [[]];
  for (const point of points) {
    if (Number.isNaN(point.x) || Number.isNaN(point.y)) segments.push([]);
    else segments[segments.length - 1].push(point);
  }
  return segments
    .map((segment) => pointsToSmoothPath(segment, tension))
    .filter(Boolean)
    .join(' ');
}

/** Bỏ các điểm ngắt nét — dùng cho polygon/fill vốn phải khép kín. */
export const withoutBreaks = (points: XY[]) =>
  points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

/**
 * Mái 2 dốc: lấy cạnh dài nhất làm hướng sống mái, trả về trục gradient 2 màu
 * và 2 đầu đường sống mái, cùng căn theo tâm bounding box xoay theo mái.
 */
function roofAxis(points: XY[]) {
  let ridge = { x: 1, y: 0 };
  let longest = 0;
  points.forEach((point, i) => {
    const next = points[(i + 1) % points.length];
    const len = Math.hypot(next.x - point.x, next.y - point.y);
    if (len > longest) {
      longest = len;
      ridge = { x: (next.x - point.x) / len, y: (next.y - point.y) / len };
    }
  });
  const normal = { x: -ridge.y, y: ridge.x };
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const span = (vec: XY) => {
    const proj = points.map((p) => (p.x - cx) * vec.x + (p.y - cy) * vec.y);
    return { min: Math.min(...proj), max: Math.max(...proj) };
  };
  const n = span(normal);
  const r = span(ridge);
  const nMid = (n.min + n.max) / 2;
  const rMid = (r.min + r.max) / 2;
  const mx = cx + normal.x * nMid + ridge.x * rMid;
  const my = cy + normal.y * nMid + ridge.y * rMid;
  const half = (r.max - r.min) / 2;
  return {
    gradient: {
      x1: mx + normal.x * (n.min - nMid),
      y1: my + normal.y * (n.min - nMid),
      x2: mx + normal.x * (n.max - nMid),
      y2: my + normal.y * (n.max - nMid),
    },
    ridgeLine: {
      x1: mx - ridge.x * half,
      y1: my - ridge.y * half,
      x2: mx + ridge.x * half,
      y2: my + ridge.y * half,
    },
  };
}

/**
 * Tách points thành các vùng rời nhau bằng điểm sentinel đặt SAU mỗi vùng:
 *   { x: NaN, y: NaN }           → kết thúc vùng KÍN (có fill)
 *   { x: Infinity, y: Infinity } → kết thúc vùng HỞ (chỉ vẽ nét, không fill)
 * Vùng cuối cùng không cần sentinel, mặc định là vùng kín.
 */
export function pointsToRegionPaths(points: XY[]): { closed: string; open: string } {
  const rings: { points: XY[]; closed: boolean }[] = [{ points: [], closed: true }];
  for (const point of points) {
    if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
      rings[rings.length - 1].points.push(point);
      continue;
    }
    rings[rings.length - 1].closed = Number.isNaN(point.x);
    rings.push({ points: [], closed: true });
  }
  const toPath = (ring: { points: XY[]; closed: boolean }) =>
    'M' + ring.points.map((p) => p.x + ',' + p.y).join(' L') + (ring.closed ? ' Z' : '');
  const pick = (closed: boolean) =>
    rings
      .filter((ring) => ring.closed === closed && ring.points.length >= (closed ? 3 : 2))
      .map(toPath)
      .join(' ');
  return { closed: pick(true), open: pick(false) };
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
  preserveAspectRatio,
}: FarmMapSvgProps) {
  // lat/lng là nguồn chuẩn; pixel chỉ là lớp hiển thị dẫn xuất (09_DECISIONS D5)
  const points = useMemo(
    () =>
      trees
        // Chỉ vẽ cây đã kích hoạt — cây chưa gán QR không có toạ độ thật
        .filter((tree) => tree.activated)
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
      preserveAspectRatio={preserveAspectRatio ?? 'xMidYMid slice'}
    >
      <rect x="0" y="0" width={layers.viewBox.width} height={layers.viewBox.height} fill="var(--color-surface-sunken)" />

      {/* Lớp ảnh thực địa đã xử lý sạch cây bên trong thửa đất */}
      {visible.satellite && (
        <image
          href="/farm-map-bg.png"
          x="0"
          y="0"
          width={layers.viewBox.width}
          height={layers.viewBox.height}
          preserveAspectRatio="none"
        />
      )}

      {/* Lớp nền layout trắng theo diện tích ranh giới thửa để custom vườn */}
      {visible.whiteCanvas && (
        <path
          id="farm-white-canvas"
          d={pointsToSmoothPath(withoutBreaks(layers.boundary.points)) + ' Z'}
          fill="#ffffff"
        />
      )}

      {/* Lớp đường giao thông: vẽ 3 lượt (lớp nền lề đường -> lớp thảm nhựa -> tim đường) uốn cong mềm mại */}
      {visible.roads && (
        <g id="roads-network" clipPath="url(#farm-boundary-clip)">
          <defs>
            {/* Đường bị cắt phẳng đúng tại ranh giới thửa, không bo tròn đầu mút */}
            <clipPath id="farm-boundary-clip">
              <path d={pointsToSmoothPath(withoutBreaks(layers.boundary.points)) + ' Z'} />
            </clipPath>
          </defs>
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
        <path
          d={pointsToBrokenSmoothPath(layers.boundary.points)}
          fill="none"
          stroke="#10b981"
          strokeWidth={visible.satellite ? 2 : 4}
          strokeLinejoin="round"
          strokeLinecap="round"
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
          if (facility.points?.length) {
            const shape = withoutBreaks(facility.points);
            const regions = pointsToRegionPaths(facility.points);
            const axis = facility.flatRoof ? null : roofAxis(shape);
            return (
              <g key={facility.id} className="facility-building">
                {axis && (
                  <defs>
                    {/* 2 dốc mái: nửa hứng nắng sáng, nửa khuất tối — stop trùng 50% cho mép sắc nét */}
                    <linearGradient
                      id={'roof-' + facility.id}
                      gradientUnits="userSpaceOnUse"
                      {...axis.gradient}
                    >
                      <stop offset="50%" stopColor="#f1f5f9" />
                      <stop offset="50%" stopColor="#b8c2d0" />
                    </linearGradient>
                    <clipPath id={'clip-' + facility.id}>
                      <path d={regions.closed} />
                    </clipPath>
                  </defs>
                )}
                {/* Bóng đổ khối nhà */}
                <path
                  d={
                    pointsToRegionPaths(
                      facility.points.map((point) => ({ x: point.x + 3, y: point.y + 4 })),
                    ).closed
                  }
                  fill="rgba(15, 23, 42, 0.3)"
                />
                {/* Mái nhà theo đúng hình dáng traced từ ảnh vệ tinh */}
                <path
                  d={regions.closed}
                  fill={axis ? `url(#roof-${facility.id})` : '#e2e8f0'}
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                {/* Các vùng hở: chỉ vẽ nét, không tô mái */}
                {regions.open && (
                  <path
                    d={regions.open}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {axis && (
                  <line
                    {...axis.ridgeLine}
                    stroke="#8b97a8"
                    strokeWidth={1.2}
                    clipPath={`url(#clip-${facility.id})`}
                  />
                )}
              </g>
            );
          }
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
        // SVG không có z-index: cây đang chọn phải render sau cùng mới nổi lên trên
        [...points]
          .sort((a, b) =>
            Number(a.tree.code === selectedCode) - Number(b.tree.code === selectedCode),
          )
          .map(({ tree, xy }) => (
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
