import type { Farm, MapAnchor } from '@/types';

export const FARM_ID = 'farm-0001';

/**
 * 2 điểm mốc neo ảnh nền: biết cả lat/lng lẫn pixel trên bản vẽ 1000×700.
 * utils/geo.ts dùng đúng 2 điểm này để quy đổi (05_FRONTEND §6.7).
 */
export const MAP_ANCHORS: MapAnchor[] = [
  {
    id: 'M1',
    label: 'Mốc góc Tây Bắc',
    latLng: { lat: 10.462, lng: 107.215 },
    xy: { x: 100, y: 80 },
  },
  {
    id: 'M4',
    label: 'Mốc góc Đông Nam',
    latLng: { lat: 10.4588, lng: 107.2185 },
    xy: { x: 900, y: 620 },
  },
];

export const FARM_SEED: Farm = {
  id: FARM_ID,
  name: 'Durian Farm — Nông trại Sầu riêng Thông minh',
  techLead: 'Nguyễn Văn An',
  offlineSyncEnabled: false,
  plotNumber: 'Thửa 142, Tờ 08',
  address: 'Xã Xuân Sơn, huyện Châu Đức, tỉnh Bà Rịa — Vũng Tàu',
  benchmark: {
    code: 'M0-TT',
    name: 'Mốc trắc địa trung tâm vườn',
    lat: 10.4604,
    lng: 107.2165,
    elevationMeters: 42.5,
    datum: 'VN-2000 / WGS-84',
    zone: 'Kinh tuyến trục 107°45′',
    source: 'default',
  },
  mapLayers: {
    viewBox: { width: 1000, height: 700 },
    boundary: {
      id: 'boundary',
      label: 'Ranh giới thửa đất',
      points: [
        { x: 90, y: 70 },
        { x: 620, y: 50 },
        { x: 930, y: 190 },
        { x: 910, y: 630 },
        { x: 400, y: 660 },
        { x: 110, y: 470 },
      ],
    },
    beds: [
      { id: 'bed-a', label: 'Liếp A', points: bedPoints(160, 140) },
      { id: 'bed-b', label: 'Liếp B', points: bedPoints(160, 310) },
      { id: 'bed-c', label: 'Liếp C', points: bedPoints(160, 480) },
    ],
    canals: [
      {
        id: 'canal-1',
        label: 'Mương chính',
        width: 14,
        points: [
          { x: 120, y: 250 },
          { x: 860, y: 250 },
        ],
      },
      {
        id: 'canal-2',
        label: 'Mương nhánh',
        width: 10,
        points: [
          { x: 120, y: 420 },
          { x: 860, y: 420 },
        ],
      },
    ],
    roads: [
      {
        id: 'road-main',
        label: 'Đường nội bộ',
        width: 18,
        points: [
          { x: 500, y: 60 },
          { x: 500, y: 650 },
        ],
      },
    ],
    reservoir: {
      id: 'reservoir',
      label: 'Hồ trữ nước',
      points: [
        { x: 740, y: 520 },
        { x: 860, y: 520 },
        { x: 880, y: 600 },
        { x: 760, y: 610 },
      ],
    },
    facilities: [
      { id: 'gate', label: 'Cổng chính', kind: 'gate', position: { x: 500, y: 60 } },
      { id: 'office', label: 'Nhà điều hành', kind: 'office', position: { x: 210, y: 90 } },
      { id: 'store', label: 'Kho vật tư', kind: 'store', position: { x: 300, y: 90 } },
      { id: 'pump', label: 'Trạm bơm', kind: 'pump', position: { x: 800, y: 470 } },
      { id: 'weather', label: 'Trạm khí tượng', kind: 'weather', position: { x: 650, y: 610 } },
      { id: 'packing', label: 'Khu sơ chế', kind: 'packing', position: { x: 380, y: 90 } },
    ],
    anchors: MAP_ANCHORS,
  },
  updatedAt: '2026-09-01T02:00:00.000Z',
};

function bedPoints(x: number, y: number) {
  const width = 680;
  const height = 110;
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}
