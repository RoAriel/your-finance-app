import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsService } from '../services/savings.service';
import type { DepositDto } from '../types';
import { api } from '../../../lib/axios';

export const useSavings = () => {
  const queryClient = useQueryClient();

  // 1. Query: Traer metas
  const query = useQuery({
    queryKey: ['savings'],
    queryFn: savingsService.getAll,
  });

  // 2. Mutation: Crear
  const createMutation = useMutation({
    mutationFn: savingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });

  // 3. Mutation: Depositar
  const depositMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepositDto }) =>
      savingsService.deposit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      // También podríamos invalidar 'transactions' si el depósito genera un gasto
    },
  });

  // 4. Mutation: Borrar
  const deleteMutation = useMutation({
    mutationFn: savingsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: savingsService.transfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      // También invalidamos transacciones para que se refleje en los historiales
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/savings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });

  return {
    goals: query.data || [],
    isLoading: query.isLoading,
    createGoal: createMutation.mutateAsync,
    depositToGoal: depositMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
    transferGoal: transferMutation.mutateAsync,
    isTransferring: transferMutation.isPending,
    updateGoal: updateMutation.mutateAsync,
  };
};
