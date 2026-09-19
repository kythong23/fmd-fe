import type { Farm, MapAnchor } from '@/types';

export const FARM_ID = 'farm-0001';

/**
 * 2 điểm mốc neo ảnh nền: biết cả lat/lng lẫn pixel trên bản vẽ 1024×512.
 * utils/geo.ts dùng đúng 2 điểm này để quy đổi (05_FRONTEND §6.7).
 */
export const MAP_ANCHORS: MapAnchor[] = [
  {
    id: 'M1',
    label: 'Mốc góc Tây Bắc',
    latLng: { lat: 10.462, lng: 107.215 },
    xy: { x: 247, y: 92 },
  },
  {
    id: 'M4',
    label: 'Mốc góc Đông Nam',
    latLng: { lat: 10.4588, lng: 107.2185 },
    xy: { x: 812, y: 300 },
  },
];

export const FARM_SEED: Farm = {
  id: FARM_ID,
  name: 'Durian Farm — Nông trại Sầu riêng Thông minh',
  techLead: 'Lê Văn Thái',
  estimatedTreeCount: 120,
  publicViewEnabled: false,
  offlineSyncEnabled: false,
  benchmark: {
    code: 'M0-TT',
    name: 'Mốc trắc địa trung tâm vườn',
    plotNumber: 'Thửa 35, Tờ 24',
    address: 'Phường Hàng Gòn, TP. Long Khánh, tỉnh Đồng Nai',
    lat: 10.8734664,
    lng: 107.2065857,
    elevationMeters: 42.5,
    datum: 'VN-2000 / WGS-84',
    zone: 'Kinh tuyến trục 107°45′',
    source: 'default',
    updatedAt: '2026-09-01T02:00:00.000Z',
  },
  mapLayers: {
    viewBox: { width: 1024, height: 510 },
    boundary: {
      id: 'boundary',
      label: 'Ranh giới thửa đất (Khớp viền đen ảnh thực địa)',
      points: [
        // Cạnh Bắc: chạy từ Tây Bắc xiên lên Đông Bắc theo mép ranh giới
        { x: 240, y: 90 },
        { x: 395, y: 51 },
        { x: 700, y: 10 },
        { x: 811, y: 5.5 },
        // Góc Đông Bắc
        { x: 814, y: 18 },
        { x: NaN, y: NaN },
        { x: 815, y: 43 },
        // Cạnh Đông: lượn xuống phía Nam dọc theo hành lang đường
        { x: 816, y: 65 },
        { x: 815, y: 100 },
        { x: 815, y: 135 },
        { x: 811, y: 170 },
        { x: 806, y: 195 },
        { x: 799, y: 220 },
        { x: 790, y: 245 },
        { x: 781, y: 265 },
        // Góc cua Đông Nam
        { x: 765, y: 290 },
        { x: 745, y: 289 },
        // Cạnh Nam: uốn cong men theo đường liên ấp
        { x: 720, y: 280 },
        { x: 690, y: 271 },
        { x: 660, y: 268 },
        { x: 630, y: 272 },
        { x: 600, y: 277 },
        { x: 565, y: 282 },
        { x: 530, y: 288 },
        // { x: 490, y: 294 },
        // { x: 450, y: 301 },
        // { x: 410, y: 307 },
        // { x: 380, y: 313 },
        // { x: 330, y: 319 },
        // { x: 300, y: 323 },
        // { x: 275, y: 318 },
        // Góc Tây Nam
        { x: 290, y: 325},
        { x: 258, y: 305 },
        // Cạnh Tây: uốn lượn hướng lên lại góc Tây Bắc
        { x: 246, y: 265 },
        { x: 220, y: 230 },
        { x: 219, y: 200 },
        { x: 221, y: 180 },
        { x: 229, y: 160 },
        { x: 237, y: 140 },
        { x: 240, y: 115 },
        { x: 240, y: 95 },
      ],
    },
    beds: [],
    canals: [],
    roads: [
      {
        id: 'road-warehouse-east',
        label: 'Đường nội bộ: Nhà kho chính → ranh giới Đông Bắc',
        width: 22,
        // Tim đường trace theo hành lang đường trên ảnh nền 1024×510
        points: [
          { x: 565, y: 71 },
          { x: 685, y: 40 },
          { x: 810, y: 31 },
          // kéo quá ranh giới ~30px để clipPath cắt phẳng đúng mép thửa
          { x: 845, y: 34 },
        ],
      },
    ],
    reservoir: null,
    facilities: [
      {
        id: 'warehouse-main',
        label: 'Nhà kho chính',
        kind: 'warehouse',
        position: { x: 494, y: 74 },
        // Traced theo đúng khối nhà tôn dài trên ảnh nền 1024×510
        points: [
          { x: 420, y: 57 },
          // { x: 516, y: 45 },
          { x: 547, y: 45 },
          { x: 547.5, y: 50 },
          { x: 552, y: 50 },
          { x: 552, y: 54 },
          { x: 567, y: 54 },
          { x: 569, y: 83 },
          { x: 549, y: 85 },
          { x: 549, y: 93 },
          { x: 426, y: 104 },
          { x: 425, y: 97 },
          { x: 420, y: 97 },
          { x: 418, y: 81.5 },
          { x: 421, y: 81.5 },
        ],
      },
      {
        id: 'warehouse-small',
        label: 'Kho phụ',
        kind: 'warehouse',
        position: { x: 609, y: 119 },
        points: [
          { x: 599, y: 112 },
          { x: 617, y: 110.5 },
          { x: 619, y: 127 },
          { x: 600, y: 128 },
        ],
      },
      {
        id: 'house-east',
        flatRoof: true,
        label: 'Nhà Đông',
        kind: 'house',
        position: { x: 762, y: 109 },
        points: [
          { x: 740, y: 97 },
          { x: 785, y: 88 },
          { x: 786, y: 90 },
          { x: 790, y: 89 },
          { x: 792, y: 99 },
          { x: 784, y: 101 },
          { x: 783, y: 96 },
          { x: 741, y: 104 },
          { x: NaN, y: NaN },
          { x: 780, y: 103 },
          { x: 785, y: 102},
          { x: 787, y: 121 },
          { x: 783, y: 122 },
          { x: NaN, y: NaN },
          { x: 735, y: 113 },
          { x: 779, y: 105},
          { x: 780.5, y: 117 },
          { x: 750, y: 126 },
          { x: 738, y: 128 },
          { x: NaN, y: NaN },
          { x: 735, y: 112 },
          { x: 734, y: 108 },
          { x: 723, y: 110 },
          { x: 729, y: 138 },
          { x: 740, y: 136 },
          { x: 738.5, y: 129 },
          { x: NaN, y: NaN },
        ],
      },
    ],
    anchors: MAP_ANCHORS,
  },
  updatedAt: '2026-09-01T02:00:00.000Z',
};
