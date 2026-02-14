import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast'; // Asegúrate de tener esto
import { budgetsService } from '../services/budgets.service';
import { budgetKeys } from '../keys';
import type {
  CreateBudgetDTO,
  UpdateBudgetDTO,
} from '../services/budgets.service';
import { isAxiosError } from 'axios';

export const useBudgets = (month: number, year: number) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: budgetKeys.list({ month, year }),
    queryFn: () => budgetsService.findAll(month, year),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  // Función helper para errores específicos de presupuesto
  const handleBudgetError = (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 400) {
      // El backend devuelve: { message: "La suma de los hijos excede el límite del padre" }
      const serverMessage = error.response.data.message;
      // Mostramos un toast persistente o diferente para errores de lógica de negocio
      toast.error(serverMessage || 'Error de validación jerárquica', {
        icon: '🛑',
        duration: 5000,
      });
    }
    // Si no es 400, dejamos que el queryClient global maneje el error genérico
  };

  // Crear
  const createMutation = useMutation({
    mutationFn: (dto: CreateBudgetDTO) => budgetsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list({ month, year }),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Presupuesto creado');
    },
    onError: handleBudgetError, // 👈 Interceptamos error
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
      toast.success('Presupuesto actualizado');
    },
    onError: handleBudgetError, // 👈 Interceptamos error
  });

  // Borrar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list({ month, year }),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Presupuesto eliminado');
    },
  });

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createBudget: createMutation.mutateAsync,
    updateBudget: (id: string, dto: UpdateBudgetDTO) =>
      updateMutation.mutateAsync({ id, dto }),
    deleteBudget: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
