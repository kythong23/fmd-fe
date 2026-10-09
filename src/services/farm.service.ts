import { http } from './http';
import { clone, mockCall } from './mock/db';
import { store } from './mock/store';
import type { BenchmarkInput, Farm, FarmSettingsInput } from '@/types';

/** GET /farm — phẳng, không có mapLayers, bọc thêm cờ success */
type FarmResponse = Omit<Farm, 'mapLayers'> & { success: boolean };

export interface ProvisionResult {
  estimatedTreeCount: number;
  created: number;
  deleted: number;
  kept: number;
  total: number;
  message: string;
  codes: string[];
}

/** ponytail: bản đồ vẫn lấy từ store cục bộ (seed, HMR cập nhật được), bỏ khi API trả mapLayers */
function toFarm({ ...farm }: FarmResponse): Farm {
  store.farm = { ...farm, mapLayers: clone(store.farm.mapLayers) };
  return store.farm;
}

export const farmService = {
  detail: async (): Promise<Farm> => toFarm(await http<FarmResponse>('/farm')),

  updateSettings: async (input: FarmSettingsInput): Promise<Farm> =>
    toFarm(
      await http<FarmResponse>('/farm/settings', {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    ),

  /**
   * POST /farm/trees/provision — số mã QR hội tụ về đúng số cây khai: thiếu tạo thêm, thừa xoá mã trống.
   * Mã đã có dữ liệu thì BE giữ lại (`kept`) và giải thích trong `message`.
   */
  provisionTrees: (estimatedTreeCount: number): Promise<ProvisionResult> =>
    http<ProvisionResult>('/farm/trees/provision', {
      method: 'POST',
      body: JSON.stringify({ estimatedTreeCount }),
    }),

  /** Mốc trắc địa lưu ở server — không phải localStorage riêng từng máy (03_DATABASE §4) */
  updateBenchmark: (input: BenchmarkInput): Promise<Farm> =>
    mockCall(() => {
      store.farm = {
        ...store.farm,
        benchmark: { ...store.farm.benchmark, ...input, updatedAt: new Date().toISOString() },
        updatedAt: new Date().toISOString(),
      };
      return clone(store.farm);
    }),
};
