import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsService } from '../services/budgets.service';
import { budgetKeys } from '../keys'; // 👈 Importamos llaves
import type {
  CreateBudgetDTO,
  UpdateBudgetDTO,
} from '../services/budgets.service';

export const useBudgets = (month: number, year: number) => {
  const queryClient = useQueryClient();

  // 1. QUERY (Reemplaza al useEffect + useState)
  // Cada vez que cambie month o year, React Query refetchea automáticamente.
  const query = useQuery({
    queryKey: budgetKeys.list({ month, year }),
    queryFn: () => budgetsService.findAll(month, year),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
    placeholderData: (previousData) => previousData, // Mantiene datos viejos al cambiar de mes (mejor UX)
  });

  // 2. MUTACIONES

  // Crear
  const createMutation = useMutation({
    mutationFn: (dto: CreateBudgetDTO) => budgetsService.create(dto),
    onSuccess: () => {
      // Invalidamos la lista actual para ver el nuevo presupuesto
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list({ month, year }),
      });
      // El dashboard general también cambia
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBudgetDTO }) =>
      budgetsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list({ month, year }),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Borrar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list({ month, year }),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    // Datos limpios directos del query
    budgets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,

    // Acciones
    createBudget: createMutation.mutateAsync,
    updateBudget: (id: string, dto: UpdateBudgetDTO) =>
      updateMutation.mutateAsync({ id, dto }), // Wrapper para coincidir con la firma anterior
    deleteBudget: deleteMutation.mutateAsync,

    // Estados de carga
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Refetch manual (rara vez necesario con React Query, pero lo mantenemos por compatibilidad)
    refetch: query.refetch,
  };
};
