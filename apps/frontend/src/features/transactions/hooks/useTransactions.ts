import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../types';

export const useTransactions = (overrides?: TransactionFilters) => {
  const queryClient = useQueryClient();

  // 1. Estado local para filtros (Search, Fechas, etc.)
  const [internalFilters, setInternalFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    page: 1,
    limit: 10,
    search: '',
    accountId: '',
    startDate: '',
    endDate: '',
  });

  // Fusionamos filtros internos con los que vengan de props (overrides)
  const activeFilters = { ...internalFilters, ...overrides };

  // 2. EL QUERY (Obtener datos)
  const query = useQuery({
    // La key incluye los filtros para que React Query refresque automático si cambian
    queryKey: ['transactions', activeFilters],

    // 👇 ¡AQUÍ ESTÁ LA MAGIA!
    // Ya no construimos URLSearchParams aquí. Llamamos al servicio y él se encarga.
    queryFn: () => transactionsService.getAll(activeFilters),

    // Mantiene los datos viejos mientras cargan los nuevos (mejor UX al paginar)
    placeholderData: (previousData) => previousData,
  });

  // 3. MUTACIONES (Crear, Actualizar, Borrar) - Estas quedan igual
  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionDTO) =>
      transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDTO }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // 4. RETORNO UNIFICADO
  return {
    ...query,
    transactions: query.data?.data || [],
    meta: query.data?.meta,

    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,

    filters: internalFilters,
    setFilters: setInternalFilters,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// Hooks auxiliares exportados por si se usan individualmente
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
  });
};
