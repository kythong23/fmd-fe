import { http } from './http';
import type { Material, MaterialFilters, MaterialInput } from '@/types';

export const materialsService = {
  list: async (filters: MaterialFilters = {}): Promise<Material[]> => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.type) params.set('type', filters.type);
    if (filters.active) params.set('active', filters.active);
    const query = params.toString();
    const { items } = await http<{ items: Material[] }>(
      '/materials' + (query ? '?' + query : ''),
    );
    return items;
  },

  create: (input: MaterialInput): Promise<Material> =>
    http<Material>('/materials', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: string, input: Partial<MaterialInput>): Promise<Material> =>
    http<Material>('/materials/' + id, { method: 'PATCH', body: JSON.stringify(input) }),

  remove: (id: string): Promise<void> =>
    http<void>('/materials/' + id, { method: 'DELETE' }),
};
