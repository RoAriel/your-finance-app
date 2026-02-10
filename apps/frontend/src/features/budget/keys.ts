export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...budgetKeys.lists(), { ...filters }] as const,
};
