import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../types';
import { transactionKeys } from '../keys';

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

  const activeFilters = { ...internalFilters, ...overrides };

  // 2. QUERY (Lectura)
  const query = useQuery({
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
      // 👇 Invalidamos TODO lo necesario para refrescar la UI
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 👈 ACTUALIZA SALDOS SELECTOR
      queryClient.invalidateQueries({ queryKey: ['budgets'] }); // 👈 ACTUALIZA BARRAS PRESUPUESTO
    },
  });

  // Actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDTO }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 👈 ACTUALIZA SALDOS SELECTOR
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  // Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 👈 ACTUALIZA SALDOS SELECTOR
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
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

// --- Hooks Auxiliares ---

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 👈 ACTUALIZA SALDOS
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 👈 ACTUALIZA SALDOS
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 👈 ACTUALIZA SALDOS
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useBalance = () => {
  return useQuery({
    queryKey: transactionKeys.balance(),
    queryFn: transactionsService.getBalance,
  });
};
