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
  plotNumber: 'Thửa 35, Tờ 24',
  address: 'Phường Hàng Gòn, TP. Long Khánh, tỉnh Đồng Nai',
  benchmark: {
    code: 'M0-TT',
    name: 'Mốc trắc địa trung tâm vườn',
    lat: 10.8734664,
    lng: 107.2065857,
    elevationMeters: 42.5,
    datum: 'VN-2000 / WGS-84',
    zone: 'Kinh tuyến trục 107°45′',
    source: 'default',
  },
  mapLayers: {
    viewBox: { width: 1000, height: 700 },
    boundary: {
      id: 'boundary',
      label: 'Ranh giới thửa đất (Tờ 24 - Thửa 35)',
      points: [
        // Điểm A: Góc tây bắc thấp (đầu cạnh 46.9m)
        { x: 120, y: 245 },
        // Cạnh 46.9m dốc nhẹ lên sang phải
        { x: 308, y: 228 },
        // Rãnh bậc thụt xuống 8.1m
        { x: 308, y: 260 },
        // Chân góc thụt
        { x: 326, y: 258 },
        // Cạnh 137.0m chạy ngang sang phải (hơi dốc nhẹ lên)
        { x: 874, y: 210 },
        // Cạnh phải giáp đường lớn dọc xuống: hơi uốn lượn nhẹ
        { x: 880, y: 240 },
        { x: 880, y: 285 },
        { x: 868, y: 350 },
        { x: 846, y: 405 },
        // Bo cua vòng xuống cạnh đáy phía đông nam
        { x: 818, y: 450 },
        { x: 780, y: 472 },
        // Cạnh đáy lồi gập ở giữa: từ đông nam (780, 472) chếch lên đỉnh gập ở giữa
        { x: 672, y: 442 },
        // Đỉnh uốn của đường ở giữa đáy
        { x: 630, y: 442 },
        // Từ đỉnh uốn dốc chéo xuống tây nam men theo đường cong (58.6m, 34.8m)
        { x: 395, y: 508 },
        { x: 205, y: 546 },
        // Đoạn vát góc tây nam (14.0m)
        { x: 138, y: 502 },
        // Cạnh trái bo cong lượn dọc mương: đi lên uốn cong nhẹ sang trái
        { x: 108, y: 425 },
        { x: 92, y: 350 },
        { x: 96, y: 290 },
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
