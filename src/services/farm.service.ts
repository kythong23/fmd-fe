import { http } from './http';
import { clone, mockCall } from './mock/db';
import { FARM_SEED } from './mock/farm.seed';
import { store } from './mock/store';
import type { BenchmarkInput, Farm, FarmSettingsInput } from '@/types';

/** GET /farm — phẳng, không có mapLayers, bọc thêm cờ success */
type FarmResponse = Omit<Farm, 'mapLayers'> & { success: boolean };

/** ponytail: bản đồ vẫn lấy từ seed cục bộ, bỏ khi API trả mapLayers */
function toFarm({...farm }: FarmResponse): Farm {
  store.farm = { ...farm, mapLayers: clone(FARM_SEED.mapLayers) };
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
