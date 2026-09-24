import { http } from './http';
import type { ReportFilters, ReportSummary } from '@/types';

function toQuery({ from, to, block, type }: ReportFilters): string {
  const params = new URLSearchParams({ from, to });
  if (block) params.set('block', block);
  if (type) params.set('type', type);
  return params.toString();
}

export const reportsService = {
  summary: (filters: ReportFilters): Promise<ReportSummary> =>
    http<ReportSummary>('/reports/summary?' + toQuery(filters)),

  /** CSV sinh ở BE — cùng một nguồn số với bảng trên màn hình (05_FRONTEND §6.14) */
  summaryCsv: (filters: ReportFilters): Promise<string> =>
    http<string>('/reports/summary.csv?' + toQuery(filters)),
};
