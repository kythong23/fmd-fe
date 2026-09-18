import { xyToLatLng } from '@/utils/geo';
import type {
  ActionTaken,
  ActivityType,
  FruitCondition,
  HistoryRecord,
  LeafCondition,
  Tree,
  TreeStatus,
  TreeVariety,
} from '@/types';
import { FARM_ID, MAP_ANCHORS } from './farm.seed';

/**
 * Seed 30 cây sinh bằng PRNG cố định — đủ phủ mọi trạng thái/giống/lô mà không
 * phải chép tay 700 dòng dữ liệu.
 */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

const VARIETY_LIST: TreeVariety[] = [
  'Ri6',
  'Monthong (Dona)',
  'Musang King',
  'Black Thorn',
  'Chuồng Bò',
];
const STATUS_LIST: TreeStatus[] = ['healthy', 'healthy', 'healthy', 'monitoring', 'problem', 'unknown'];
const LEAF_LIST: LeafCondition[] = ['good', 'fair', 'poor', 'yellowing'];
const FRUIT_LIST: FruitCondition[] = ['developing', 'blooming', 'maturing', 'harvested', 'none'];
const BLOCKS = ['A', 'B', 'C'];
const PERFORMERS = [
  'Nguyễn Văn An (KTV)',
  'Trần Thị Bích (Nhân công)',
  'Lê Minh Cường (Nhân công)',
];

const BASE_SCORE: Record<TreeStatus, number> = {
  healthy: 92,
  monitoring: 76,
  problem: 54,
  unknown: 68,
};

const ACTIVITY_LABEL: Record<ActionTaken, string> = {
  watering: 'Tưới nước bổ sung',
  fertilizing: 'Bón phân hữu cơ / NPK',
  spraying: 'Phun thuốc phòng trừ sâu bệnh',
  pruning: 'Cắt tỉa cành & neo trái',
  treatment: 'Điều trị bệnh thực địa',
  none: 'Kiểm tra sức khỏe định kỳ',
};

const ACTIVITY_TYPE: Record<ActionTaken, ActivityType> = {
  watering: 'watering',
  fertilizing: 'fertilizing',
  spraying: 'spraying',
  pruning: 'pruning',
  treatment: 'treatment',
  none: 'health_check',
};

export function activityLabelFor(action: ActionTaken): string {
  return ACTIVITY_LABEL[action] ?? ACTIVITY_LABEL.none;
}

export function activityTypeFor(action: ActionTaken): ActivityType {
  return ACTIVITY_TYPE[action] ?? 'health_check';
}

const DESCRIPTIONS = [
  'Đọt già đều, không phát hiện rầy. Tán lá dày, màu xanh đậm.',
  'Phát hiện vài lá vàng ở tầng dưới, cần theo dõi thêm 1 tuần.',
  'Có dấu hiệu nấm Phytophthora ở gốc, đã xử lý vôi và thuốc đặc trị.',
  'Cây ra hoa đều, đã tỉa bớt chùm hoa yếu để nuôi trái.',
  'Kiểm tra định kỳ, độ ẩm đất trong ngưỡng an toàn.',
  'Trái non rụng nhẹ sau mưa lớn, đã bổ sung canxi-bo.',
];

const ACTIONS: ActionTaken[] = ['watering', 'fertilizing', 'spraying', 'pruning', 'treatment', 'none'];

const DAY_MS = 86_400_000;
const SEED_NOW = Date.parse('2026-09-12T02:00:00.000Z');

function buildHistory(
  treeId: string,
  treeCode: string,
  status: TreeStatus,
  random: () => number,
  count: number,
  startOffsetDays: number,
): HistoryRecord[] {
  const records: HistoryRecord[] = [];
  for (let index = 0; index < count; index += 1) {
    const action = ACTIONS[Math.floor(random() * ACTIONS.length)];
    const occurredAt = new Date(SEED_NOW - (startOffsetDays + index * 9 + Math.floor(random() * 5)) * DAY_MS);
    records.push({
      id: treeCode + '-h' + String(count - index).padStart(2, '0'),
      treeId,
      treeCode,
      farmId: FARM_ID,
      occurredAt: occurredAt.toISOString(),
      activity: activityLabelFor(action),
      type: activityTypeFor(action),
      status: index === 0 ? status : 'healthy',
      description: DESCRIPTIONS[Math.floor(random() * DESCRIPTIONS.length)],
      performer: PERFORMERS[Math.floor(random() * PERFORMERS.length)],
      dosage: action === 'fertilizing' ? 'NPK 16-16-8 (350g) + 2kg phân trùn quế' : null,
      measurements: {
        height: Number((3 + random() * 4).toFixed(1)),
        trunkDiameter: Math.round(18 + random() * 20),
        soilMoisture: Math.round(45 + random() * 40),
        fruitCount: Math.round(random() * 60),
      },
      images: [],
      conditions: index % 2 === 0 ? ['leaf', 'fruit'] : ['soil'],
      actionTaken: action,
      notes: null,
    });
  }
  return records;
}

// 30 vị trí cây sầu riêng bố trí theo các hàng lối thực tế từ ảnh vệ tinh Google Maps
// Phân bố tập trung ở khu vực phía Tây và trung tâm vườn, chừa lối đi thông thoáng cho đường nội bộ
const TREE_GRID_LAYOUT = [
  // Hàng 1 (phía Bắc, dưới dãy nhà xưởng)
  { x: 285, y: 140 }, { x: 325, y: 135 }, { x: 365, y: 130 }, { x: 405, y: 126 }, { x: 445, y: 122 },
  { x: 485, y: 118 }, { x: 525, y: 115 }, { x: 565, y: 112 }, { x: 648, y: 126 }, { x: 706, y: 150 },

  // Hàng 2 (dải trung tâm vườn)
  { x: 280, y: 205 }, { x: 320, y: 200 }, { x: 360, y: 196 }, { x: 400, y: 192 }, { x: 440, y: 188 },
  { x: 480, y: 185 }, { x: 520, y: 182 }, { x: 560, y: 178 }, { x: 645, y: 190 }, { x: 712, y: 205 },

  // Hàng 3 (phía Nam, men theo ranh giới đường liên ấp)
  { x: 290, y: 270 }, { x: 330, y: 266 }, { x: 370, y: 262 }, { x: 410, y: 258 }, { x: 450, y: 254 },
  { x: 490, y: 250 }, { x: 530, y: 247 }, { x: 570, y: 243 }, { x: 648, y: 245 }, { x: 716, y: 246 },
];

function buildTrees(): { trees: Tree[]; history: HistoryRecord[] } {
  const random = makeRandom(20260915);
  const trees: Tree[] = [];
  const history: HistoryRecord[] = [];

  for (let index = 0; index < TREE_GRID_LAYOUT.length; index += 1) {
    const code = 'SD-' + String(index + 1).padStart(3, '0');
    const id = 'tree-' + String(index + 1).padStart(3, '0');
    const rowNumber = Math.floor(index / 10) + 1;
    const block = BLOCKS[rowNumber - 1] ?? 'A';
    const status = STATUS_LIST[Math.floor(random() * STATUS_LIST.length)];
    const score = Math.max(0, Math.min(100, BASE_SCORE[status] + Math.round(random() * 6 - 3)));

    const mapPoint = TREE_GRID_LAYOUT[index]!;
    // Chuyển pixel chuẩn sang GPS để đảm bảo đồng nhất GPS và vị trí bản đồ
    const coordinates = xyToLatLng(mapPoint, MAP_ANCHORS) ?? { lat: 10.46, lng: 107.216 };

    const plantedYear = 2015 + (index % 8);
    const historyCount = 2 + Math.floor(random() * 4);
    const treeHistory = buildHistory(
      id,
      code,
      status,
      random,
      historyCount,
      index % 5 === 0 ? 18 + Math.floor(random() * 9) : Math.floor(random() * 6),
    );
    history.push(...treeHistory);

    trees.push({
      id,
      farmId: FARM_ID,
      code,
      variety: VARIETY_LIST[index % VARIETY_LIST.length],
      activated: true,
      plantedDate: plantedYear + '-06-15',
      location: {
        block,
        row: String(rowNumber),
        position: String((index % 10) + 1),
        coordinates,
        mapPoint,
        bedName: 'Liếp ' + block + '-' + String(rowNumber).padStart(2, '0'),
        moundNumber: 'Mô ' + (index + 1),
      },
      canopyRadius: Number((2 + random() * 2).toFixed(1)),
      status,
      healthScore: score,
      soilMoisture: Math.round(45 + random() * 40),
      leafCondition: LEAF_LIST[Math.floor(random() * LEAF_LIST.length)],
      flowering: random() > 0.5,
      floweringStage: random() > 0.5 ? 'Mắt cua sáng' : null,
      fruitCondition: FRUIT_LIST[Math.floor(random() * FRUIT_LIST.length)],
      fruitCount: Math.round(random() * 60),
      heightMeters: Number((3 + random() * 4).toFixed(1)),
      trunkDiameterCm: Math.round(18 + random() * 20),
      image: null,
      gallery: [],
      notes: null,
      lastUpdated: treeHistory[0]?.occurredAt ?? null,
      lastUpdatedBy: treeHistory[0]?.performer ?? null,
      createdAt: plantedYear + '-06-15T03:00:00.000Z',
    });
  }

  return { trees, history };
}

const seeded = buildTrees();

export const TREES_SEED: Tree[] = seeded.trees;
export const HISTORY_SEED: HistoryRecord[] = seeded.history;
