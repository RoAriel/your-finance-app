import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <--- Agregamos imports
import { transactionsService } from '../services/transactions.service';
import { logger } from '../../../utils/appLogger';
import type { UpdateTransactionDTO, CreateTransactionDTO } from '../types';

// Clave única para el caché (si cambiamos de página, la clave cambia y refetchea)
export const useTransactions = (page: number = 1) => {
  return useQuery({
    queryKey: ['transactions', page], // [nombre, dependencia]
    queryFn: () => transactionsService.getAll(page),

    // Opcional: Mantener los datos viejos mientras cargan los nuevos (mejor UX)
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient(); // Accedemos al "Jefe de Cocina"

  return useMutation({
    mutationFn: (newTransaction: CreateTransactionDTO) =>
      transactionsService.create(newTransaction),

    // onSuccess se ejecuta si el backend responde 200/201 OK
    onSuccess: () => {
      // AQUÍ OCURRE LA MAGIA:
      // Le decimos al cliente: "Invalida todo lo que empiece por ['transactions']"
      // Esto forzará a useTransactions a hacer un refetch automático.
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });

      console.log('Transacción creada y lista actualizada 🔄');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) =>
      transactionsService.delete(transactionId),

    onSuccess: () => {
      // Invalidamos la lista para que desaparezca el item borrado
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      logger.success('Transacción eliminada correctamente');
    },
    onError: (error) => {
      logger.error('Error al eliminar transacción', error);
      alert('No se pudo eliminar la transacción');
    },
  });
};

export const useBalance = () => {
  return useQuery({
    queryKey: ['balance'],
    queryFn: transactionsService.getBalance,
    staleTime: 1000 * 60, // 1 minuto
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDTO }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      // Invalidamos para refrescar tabla y balance
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
};
