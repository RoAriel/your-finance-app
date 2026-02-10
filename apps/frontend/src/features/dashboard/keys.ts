export const dashboardKeys = {
  all: ['dashboard'] as const,
  report: (filters: Record<string, unknown>) =>
    [...dashboardKeys.all, { ...filters }] as const,
};
