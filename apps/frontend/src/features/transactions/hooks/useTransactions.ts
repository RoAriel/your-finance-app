import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type { CreateTransactionDTO, UpdateTransactionDTO } from '../types';
import { api } from '../../../lib/axios';
import type { PaginatedResponse } from '../../../types';
import type { Transaction } from '../types';

interface TransactionFilters {
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
  search?: string;
}
export const useTransactions = (overrides?: TransactionFilters) => {
  const queryClient = useQueryClient();

  // 1. Estado local para filtros (Search, Fechas, etc.)

  const [internalFilters, setInternalFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    page: 1,
    limit: 10,
    search: '',
  });

  const activeFilters = overrides || internalFilters;

  // 2. EL QUERY (Obtener datos)
  const query = useQuery({
    // La key debe incluir los filtros activos para que refresque si cambian
    queryKey: ['transactions', activeFilters],
    queryFn: async () => {
      // Construimos la URL string con los filtros activos
      const params = new URLSearchParams({
        page: activeFilters.page?.toString() || '1',
        limit: activeFilters.limit?.toString() || '10',
        month: activeFilters.month?.toString() || '',
        year: activeFilters.year?.toString() || '',
        search: activeFilters.search || '',
      });

      const { data } = await api.get<PaginatedResponse<Transaction>>(
        `/transactions?${params.toString()}`
      );
      return data;
    },
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
    filters: internalFilters,
    setFilters: setInternalFilters,

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
