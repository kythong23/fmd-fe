import { parseCoordinate } from './coords';
import { latLngToXY, xyToLatLng } from './geo';
import { computeHealthScore } from './health-score';
import { MAP_ANCHORS } from '@/services/mock/farm.seed';

export interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

function check(name: string, condition: boolean, detail = ''): CheckResult {
  return { name, ok: condition, detail };
}

function near(a: number, b: number, tolerance: number): boolean {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Self-check cho 3 chỗ logic dễ sai âm thầm: parse tọa độ, quy đổi lat/lng ↔ pixel,
 * và công thức healthScore. Chạy ở trang /dev/ui (chỉ bản dev) — không cần test runner.
 */
export function runSelfChecks(): CheckResult[] {
  const decimal = parseCoordinate('10.4604, 107.2165');
  const google = parseCoordinate('https://www.google.com/maps/@10.4604,107.2165,17z');
  const dms = parseCoordinate('10°27\'37.4"N 107°12\'59.4"E');

  const origin = { lat: 10.462, lng: 107.215 };
  const xy = latLngToXY(origin, MAP_ANCHORS);
  const roundTrip = xy ? xyToLatLng(xy, MAP_ANCHORS) : null;

  return [
    check('parse tọa độ thập phân', decimal?.lat === 10.4604 && decimal.lng === 107.2165),
    check('parse link Google Maps', google?.lat === 10.4604 && google.lng === 107.2165),
    check(
      'parse DMS',
      dms !== null && near(dms.lat, 10.4604, 0.001) && near(dms.lng, 107.2165, 0.001),
      dms ? dms.lat.toFixed(4) + ', ' + dms.lng.toFixed(4) : 'null',
    ),
    check('chuỗi rác trả null', parseCoordinate('không phải tọa độ') === null),
    check('lat/lng → pixel đúng mốc', xy !== null && near(xy.x, 100, 0.01) && near(xy.y, 80, 0.01)),
    check(
      'quy đổi hai chiều khớp',
      roundTrip !== null &&
        near(roundTrip.lat, origin.lat, 1e-9) &&
        near(roundTrip.lng, origin.lng, 1e-9),
    ),
    check('healthScore healthy kẹp 88–100', computeHealthScore('healthy', 10) === 88),
    check('healthScore problem kẹp 45–65', computeHealthScore('problem', 100) === 65),
    check('healthScore monitoring kẹp 70–84', computeHealthScore('monitoring', 95) === 84),
  ];
}
