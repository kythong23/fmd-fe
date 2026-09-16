export const ROUTES = {
  login: '/login',
  dashboard: '/',
  trees: '/trees',
  tree: (code: string) => `/tree/${code}`,
  treeHistory: (code: string) => `/tree/${code}/history`,
  map: '/map',
  qr: '/qr',
  activity: '/activity',
  settings: '/settings',
  forbidden: '/403',
} as const;

/** Ngưỡng "chưa cập nhật lâu ngày" — giả định tạm (05_FRONTEND §21.4) */
export const STALE_UPDATE_DAYS = 14;

export const PAGE_SIZE = 25;
