import { latLngToXY } from '@/utils/geo';
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
 * phải chép tay 700 dòng dữ liệu. ponytail: đổi sang dump dữ liệu thật khi có BE.
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

/** Nhãn hoạt động sinh từ actionTaken — BE sẽ làm việc này (04_API §2.2) */
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
/** Mốc thời gian cố định để dữ liệu seed không đổi theo ngày chạy */
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

function buildTrees(): { trees: Tree[]; history: HistoryRecord[] } {
  const random = makeRandom(20260915);
  const trees: Tree[] = [];
  const history: HistoryRecord[] = [];

  for (let index = 0; index < 30; index += 1) {
    const code = 'SD-' + String(index + 1).padStart(3, '0');
    const id = 'tree-' + String(index + 1).padStart(3, '0');
    const blockIndex = index % BLOCKS.length;
    const block = BLOCKS[blockIndex];
    const rowNumber = Math.floor(index / BLOCKS.length) + 1;
    const status = STATUS_LIST[Math.floor(random() * STATUS_LIST.length)];
    const score = Math.max(0, Math.min(100, BASE_SCORE[status] + Math.round(random() * 6 - 3)));

    // lat/lng là dữ liệu gốc; mapPoint chỉ là lớp hiển thị dẫn xuất (09_DECISIONS D5)
    const coordinates = {
      lat: 10.4614 - blockIndex * 0.0009 - (rowNumber % 2) * 0.00012,
      lng: 107.2156 + rowNumber * 0.00021,
    };
    const plantedYear = 2015 + (index % 8);
    const historyCount = 2 + Math.floor(random() * 4);
    const treeHistory = buildHistory(id, code, status, random, historyCount, index % 5 === 0 ? 18 + Math.floor(random() * 9) : Math.floor(random() * 6));
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
        position: String((index % 4) + 1),
        coordinates,
        mapPoint: latLngToXY(coordinates, MAP_ANCHORS),
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
