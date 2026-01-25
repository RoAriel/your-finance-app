import { useQuery } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';

// Clave única para el caché (si cambiamos de página, la clave cambia y refetchea)
export const useTransactions = (page: number = 1) => {
  return useQuery({
    queryKey: ['transactions', page], // [nombre, dependencia]
    queryFn: () => transactionsService.getAll(page),

    // Opcional: Mantener los datos viejos mientras cargan los nuevos (mejor UX)
    placeholderData: (previousData) => previousData,
  });
};
