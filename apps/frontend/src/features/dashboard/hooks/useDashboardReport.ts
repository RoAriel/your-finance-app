import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import type { DashboardReportResponse } from '../types';

interface Filters {
  month: number;
  year: number;
}

const getDashboardReport = async ({ month, year }: Filters) => {
  // Asumimos que el backend acepta query params para filtrar
  const response = await api.get<DashboardReportResponse>(
    '/reports/dashboard',
    {
      params: { month, year },
    }
  );
  return response.data;
};

export const useDashboardReport = (filters: Filters) => {
  return useQuery({
    // 1. CORRECCIÓN DE LLAVE: Usamos 'dashboard' para coincidir con la invalidación
    // Si prefieres 'dashboard-report', debes cambiarlo también en useTransactions.ts
    queryKey: ['dashboard', filters],

    // 2. LOGS TÁCTICOS INTEGRADOS
    queryFn: async () => {
      const data = await getDashboardReport(filters);

      return data;
    },

    placeholderData: (previousData) => previousData,
  });
};
