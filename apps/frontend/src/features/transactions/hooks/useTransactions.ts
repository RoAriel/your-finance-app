import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type { CreateTransactionDTO, UpdateTransactionDTO } from '../types';

export const useTransactions = () => {
  const queryClient = useQueryClient();

  // 1. Estado local para filtros (Search, Fechas, etc.)
  const [filters, setFilters] = useState({
    search: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // 2. EL QUERY (Obtener datos)
  const query = useQuery({
    queryKey: ['transactions', filters], // Se recarga si cambian los filtros
    queryFn: () => transactionsService.getAll(filters),
  });

  // 3. MUTACIÓN: CREAR
  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionDTO) =>
      transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Actualizar gráficos también
    },
  });

  // 4. MUTACIÓN: ACTUALIZAR
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDTO }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // 5. MUTACIÓN: ELIMINAR (La que te faltaba)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // 6. RETORNO UNIFICADO (Super Hook)
  return {
    // Propiedades del Query (data, isLoading, error, etc.)
    ...query,

    // Funciones de Mutación
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync, // <--- ¡Aquí está la magia!

    // Filtros para la UI
    filters,
    setFilters,

    // Estados de carga extra
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// Hooks auxiliares para componentes específicos (opcional, por compatibilidad)
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDTO }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
export const useBalance = () => {
  return useQuery({
    queryKey: ['balance'],
    queryFn: transactionsService.getBalance,
    // Opcional: refetch interval si quieres que se actualice solo
    // refetchInterval: 60000,
  });
};
