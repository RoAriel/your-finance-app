import { api } from '@/lib/axios';
import { cleanObject } from '@/utils/api-helpers';
import type { DashboardReportResponse } from '../types';

interface DashboardFilters {
  month: number;
  year: number;
  accountId?: string; // 👈 NUEVO: Filtro opcional
}

export const dashboardService = {
  getReport: async (filters: DashboardFilters) => {
    const response = await api.get<DashboardReportResponse>(
      '/reports/dashboard',
      {
        // cleanObject debe borrar accountId si viene como string vacío ""
        params: cleanObject(filters),
      }
    );
    return response.data;
  },
};
