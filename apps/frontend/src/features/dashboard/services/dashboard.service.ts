import { api } from '@/lib/axios'; // 👈 Alias
import { cleanObject } from '@/utils/api-helpers'; // 👈 Utilidad
import type { DashboardReportResponse } from '../types';

interface DashboardFilters {
  month: number;
  year: number;
}

export const dashboardService = {
  getReport: async (filters: DashboardFilters) => {
    const response = await api.get<DashboardReportResponse>(
      '/reports/dashboard',
      {
        params: cleanObject(filters),
      }
    );
    return response.data;
  },
};
