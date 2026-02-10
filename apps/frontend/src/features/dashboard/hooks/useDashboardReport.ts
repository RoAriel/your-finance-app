import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from '../keys';

interface DashboardFilters {
  month: number;
  year: number;
}

export const useDashboardReport = (filters: DashboardFilters) => {
  return useQuery({
    // 👇 Usamos la llave estandarizada
    queryKey: dashboardKeys.report(
      filters as unknown as Record<string, unknown>
    ),
    queryFn: () => dashboardService.getReport(filters),
    placeholderData: (previousData) => previousData, // Evita parpadeos al cambiar de mes
  });
};
