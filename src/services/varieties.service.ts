import { http } from './http';
import type { Variety, VarietyFilters, VarietyInput } from '@/types';

export const varietiesService = {
  list: async (filters: VarietyFilters = {}): Promise<Variety[]> => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.active) params.set('active', filters.active);
    const query = params.toString();
    const { items } = await http<{ items: Variety[] }>(
      '/varieties' + (query ? '?' + query : ''),
    );
    return items;
  },

  create: (input: VarietyInput): Promise<Variety> =>
    http<Variety>('/varieties', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: string, input: Partial<VarietyInput>): Promise<Variety> =>
    http<Variety>('/varieties/' + id, { method: 'PATCH', body: JSON.stringify(input) }),

  remove: (id: string): Promise<void> =>
    http<void>('/varieties/' + id, { method: 'DELETE' }),
};
