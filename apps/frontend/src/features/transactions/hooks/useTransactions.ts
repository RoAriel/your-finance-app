import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../types';
import { transactionKeys } from '../keys'; // 👈 IMPORTANTE: Importamos las llaves

export const useTransactions = (overrides?: TransactionFilters) => {
  const queryClient = useQueryClient();

  // 1. Estado local para filtros
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

  // Fusionamos filtros internos con los que vengan de props
  const activeFilters = { ...internalFilters, ...overrides };

  // 2. QUERY (Lectura)
  const query = useQuery({
    // 👇 Usamos la fábrica para generar la key única basada en los filtros
    queryKey: transactionKeys.list(
      activeFilters as unknown as Record<string, unknown>
    ),
    queryFn: () => transactionsService.getAll(activeFilters),
    placeholderData: (previousData) => previousData,
  });

  // 3. MUTACIONES (Escritura)

  // Crear
  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionDTO) =>
      transactionsService.create(data),
    onSuccess: () => {
      // 👇 Invalidamos TO-DO lo relacionado con transacciones (listas, balance, detalles)
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      // También refrescamos el dashboard global
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDTO }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

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

// --- Hooks Auxiliares (si los usas en otros componentes) ---

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
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
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBalance = () => {
  return useQuery({
    // 👇 Key específica para el balance
    queryKey: transactionKeys.balance(),
    queryFn: transactionsService.getBalance,
  });
};
