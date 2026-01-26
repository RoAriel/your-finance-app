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
    queryKey: ['dashboard-report', filters],
    queryFn: () => getDashboardReport(filters),
    // Esto mantiene los datos viejos mientras cargan los nuevos (mejor UX)
    placeholderData: (previousData) => previousData,
  });
};
