import type { LatLng } from '@/types';

const DECIMAL = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/;
const GOOGLE_AT = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
const GOOGLE_QUERY = /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
const DMS =
  /(\d+)[°\s]+(\d+)['′\s]+(\d+(?:\.\d+)?)["″\s]*([NSEW])[,\s]+(\d+)[°\s]+(\d+)['′\s]+(\d+(?:\.\d+)?)["″\s]*([NSEW])/i;

function dmsToDecimal(deg: string, min: string, sec: string, hemisphere: string): number {
  const value = Number(deg) + Number(min) / 60 + Number(sec) / 3600;
  return /[SW]/i.test(hemisphere) ? -value : value;
}

function valid(point: LatLng): LatLng | null {
  if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) return null;
  if (Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) return null;
  return point;
}

/**
 * Nhận link Google Maps, tọa độ thập phân hoặc DMS — người dùng dán kiểu nào cũng được.
 * Trả null khi không đọc được để UI báo lỗi tử tế thay vì lưu NaN.
 */
export function parseCoordinate(input: string): LatLng | null {
  const text = input.trim();
  if (!text) return null;

  const dms = DMS.exec(text);
  if (dms) {
    const first = dmsToDecimal(dms[1], dms[2], dms[3], dms[4]);
    const second = dmsToDecimal(dms[5], dms[6], dms[7], dms[8]);
    const latFirst = /[NS]/i.test(dms[4]);
    return valid({ lat: latFirst ? first : second, lng: latFirst ? second : first });
  }

  const at = GOOGLE_AT.exec(text) ?? GOOGLE_QUERY.exec(text);
  if (at) return valid({ lat: Number(at[1]), lng: Number(at[2]) });

  const decimal = DECIMAL.exec(text);
  if (decimal) return valid({ lat: Number(decimal[1]), lng: Number(decimal[2]) });

  return null;
}
