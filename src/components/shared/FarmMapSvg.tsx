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
          const xy = tree.location.coordinates
            ? latLngToXY(tree.location.coordinates, layers.anchors)
            : tree.location.mapPoint;
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

      {/* Lớp đường giao thông: vẽ 2 lượt (lớp nền lề đường -> lớp thảm nhựa -> tim đường) để triệt tiêu đè chồng tại các giao lộ */}
      {visible.roads && (
        <g id="roads-network">
          {/* Lượt 1: Lề đường / móng đường xám sẫm (vẽ tất cả các nhánh để tự động hòa hợp tại ngã 3, ngã 4) */}
          {layers.roads.map((road) => (
            <polyline
              key={'subbase-' + road.id}
              points={toPoints(road.points)}
              fill="none"
              stroke="#334155"
              strokeWidth={road.width + 3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Lượt 2: Mặt đường nhựa asphalts xám hiện đại (#475569 / #3f4e65) */}
          {layers.roads.map((road) => (
            <polyline
              key={'surface-' + road.id}
              points={toPoints(road.points)}
              fill="none"
              stroke={road.color ?? '#475569'}
              strokeWidth={road.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Bo tròn mềm mại tâm ngã ba tại điểm giao nhau (840, 550) */}
          <circle cx={840} cy={550} r={22} fill="#475569" />

          {/* Lượt 3: Vạch kẻ tim đường màu trắng / vàng đứt nét chuẩn giao thông */}
          {layers.roads.map((road) => (
            <polyline
              key={'marking-' + road.id}
              points={toPoints(road.points)}
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
        layers.facilities.map((facility) => (
          <g key={facility.id}>
            <rect
              x={facility.position.x - 10}
              y={facility.position.y - 10}
              width={20}
              height={20}
              rx={4}
              fill="var(--color-secondary-subtle)"
              stroke="var(--color-secondary)"
              strokeWidth={2}
            />
            <text
              x={facility.position.x}
              y={facility.position.y + 26}
              textAnchor="middle"
              fontSize={12}
              fill="var(--color-text-secondary)"
            >
              {facility.label}
            </text>
          </g>
        ))}

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
