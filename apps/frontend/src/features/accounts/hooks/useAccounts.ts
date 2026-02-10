import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  accountsService,
  type TransferDTO,
} from '../services/accounts.service';
import { accountKeys } from '../keys'; // 👈 Las nuevas llaves
import type { CreateAccountDTO, UpdateAccountDTO, AccountType } from '../types';

interface UseAccountsProps {
  type?: AccountType; // Para filtrar (ej: solo Billeteras)
}

export const useAccounts = ({ type }: UseAccountsProps = {}) => {
  const queryClient = useQueryClient();

  // 1. QUERY
  const query = useQuery({
    // Incluimos el tipo en la key para que cachee por separado (Billeteras vs Bancos)
    queryKey: accountKeys.list({ type }),
    queryFn: () => accountsService.getAll({ type }),
    // Si tu backend NO filtra por tipo, mantén el 'select' aquí abajo.
    // Si tu backend SÍ filtra, el params arriba ya lo hace.
    // Por seguridad, dejamos el select para filtrar en cliente si hace falta:
    select: (data) => {
      if (!type) return data;
      return data.filter((account) => account.type === type);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // 2. MUTACIONES

  // Crear
  const createMutation = useMutation({
    mutationFn: (data: CreateAccountDTO) => accountsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });

  // Actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDTO }) =>
      accountsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      // Si cambias el nombre de una cuenta, las transacciones deben saberlo
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Borrar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Transferir (Esta es especial de este módulo)
  const transferMutation = useMutation({
    mutationFn: (data: TransferDTO) => accountsService.transfer(data),
    onSuccess: () => {
      // Una transferencia cambia saldos de cuentas y crea transacciones
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,

    createAccount: createMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    deleteAccount: deleteMutation.mutateAsync,
    transfer: transferMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTransferring: transferMutation.isPending,
  };
};
