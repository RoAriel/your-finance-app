import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <--- Agregamos imports
import { transactionsService } from '../services/transactions.service';
import type { CreateTransactionDTO } from '../services/transactions.service';

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

      console.log('Transacción creada y lista actualizada 🔄');
    },
  });
};
