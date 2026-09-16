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

// 30 vị trí cây bố trí theo hàng lối thẳng tắp chuẩn nông trại thông minh (3 hàng x 10 cây)
// Mọi cây cách cạnh ranh giới tối thiểu ~40px nên cả tán, vòng trạng thái lẫn nhãn mã đều nằm trong thửa
const TREE_GRID_LAYOUT = [
  // Hàng 1 (phía Bắc, bám theo cạnh trên dốc nhẹ lên phải)
  { x: 200, y: 308 }, { x: 265, y: 303 }, { x: 340, y: 298 }, { x: 410, y: 293 }, { x: 480, y: 288 },
  { x: 550, y: 283 }, { x: 620, y: 278 }, { x: 690, y: 273 }, { x: 760, y: 268 }, { x: 820, y: 263 },

  // Hàng 2 (giữa thửa)
  { x: 180, y: 375 }, { x: 250, y: 370 }, { x: 320, y: 365 }, { x: 395, y: 360 }, { x: 470, y: 355 },
  { x: 545, y: 350 }, { x: 620, y: 345 }, { x: 695, y: 340 }, { x: 765, y: 335 }, { x: 825, y: 330 },

  // Hàng 3 (phía Nam, men theo cạnh đáy lồi gập ở giữa)
  { x: 195, y: 455 }, { x: 265, y: 447 }, { x: 335, y: 438 }, { x: 410, y: 428 }, { x: 485, y: 418 },
  { x: 555, y: 410 }, { x: 625, y: 402 }, { x: 690, y: 396 }, { x: 750, y: 392 }, { x: 800, y: 388 },
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
