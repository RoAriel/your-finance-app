import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services/accounts.service';
import type {
  //Account,
  //CreateAccountDTO,
  UpdateAccountDTO,
  AccountType,
} from '../types';

import type { TransferDTO } from '../services/accounts.service';
interface UseAccountsProps {
  type?: AccountType; // Filtro opcional: Si pasas 'WALLET', solo devuelve billeteras
}

export const useAccounts = ({ type }: UseAccountsProps = {}) => {
  const queryClient = useQueryClient();

  // 1. QUERY: Obtener cuentas
  const query = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    select: (data) => {
      // ✅ BUENA PRÁCTICA: Filtrado en el cliente (selector)
      // Si el backend no filtra por query param, lo hacemos aquí eficientemente.
      if (!type) return data;
      return data.filter((account) => account.type === type);
    },
  });

  // 2. MUTATIONS (Crear, Actualizar, Borrar)
  const createMutation = useMutation({
    mutationFn: accountsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDTO }) =>
      accountsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: accountsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      // Si borramos una cuenta, impacta en transacciones y dashboard
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: (data: TransferDTO) => accountsService.transfer(data),
    onSuccess: () => {
      // Invalidamos cuentas (saldos) y transacciones (historial)
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
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
    isTransferring: transferMutation.isPending,
    isCreating: createMutation.isPending,
  };
};
