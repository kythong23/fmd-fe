import type { ActivityFilters, MaterialFilters, TreeFilters, VarietyFilters } from '@/types';

export const treeKeys = {
  all: ['trees'] as const,
  list: (filters?: TreeFilters) => ['trees', 'list', filters ?? {}] as const,
  detail: (code: string) => ['trees', 'detail', code] as const,
  history: (code: string) => ['trees', 'history', code] as const,
};

export const farmKeys = {
  all: ['farm'] as const,
  detail: () => ['farm', 'detail'] as const,
};

export const activityKeys = {
  all: ['activity'] as const,
  list: (filters?: ActivityFilters) => ['activity', 'list', filters ?? {}] as const,
};

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export const materialKeys = {
  all: ['materials'] as const,
  list: (filters?: MaterialFilters) => ['materials', 'list', filters ?? {}] as const,
};

export const varietyKeys = {
  all: ['varieties'] as const,
  list: (filters?: VarietyFilters) => ['varieties', 'list', filters ?? {}] as const,
};
