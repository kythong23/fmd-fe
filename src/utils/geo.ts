import type { LatLng, MapAnchor, XY } from '@/types';

/**
 * NƠI DUY NHẤT biết phép quy đổi lat/lng ↔ pixel (05_FRONTEND §6.7).
 * MVP: phép biến đổi tương tự (scale + tịnh tiến) từ 2 điểm mốc — đủ cho vườn 2,8 ha.
 * ponytail: chỉ nâng lên affine 3 điểm khi cần xoay để chồng ảnh vệ tinh — sửa trong file này.
 */
interface Transform {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

function buildTransform(anchors: MapAnchor[]): Transform | null {
  const [a, b] = anchors;
  if (!a || !b) return null;
  const dLng = b.latLng.lng - a.latLng.lng;
  const dLat = b.latLng.lat - a.latLng.lat;
  const dx = b.xy.x - a.xy.x;
  const dy = b.xy.y - a.xy.y;
  if (!dLng || !dLat || !dx || !dy) return null;

  const scaleX = dx / dLng;
  // Trục y của SVG hướng xuống, lat tăng hướng lên → hệ số âm là bình thường
  const scaleY = dy / dLat;
  return {
    scaleX,
    scaleY,
    offsetX: a.xy.x - a.latLng.lng * scaleX,
    offsetY: a.xy.y - a.latLng.lat * scaleY,
  };
}

export function latLngToXY(point: LatLng, anchors: MapAnchor[]): XY | null {
  const t = buildTransform(anchors);
  if (!t) return null;
  return {
    x: point.lng * t.scaleX + t.offsetX,
    y: point.lat * t.scaleY + t.offsetY,
  };
}

export function xyToLatLng(point: XY, anchors: MapAnchor[]): LatLng | null {
  const t = buildTransform(anchors);
  if (!t) return null;
  return {
    lng: (point.x - t.offsetX) / t.scaleX,
    lat: (point.y - t.offsetY) / t.scaleY,
  };
}
