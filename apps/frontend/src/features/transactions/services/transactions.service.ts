import { api } from '@/lib/axios'; // 👈 Alias nuevo
import { cleanObject } from '@/utils/api-helpers'; // 👈 Utilidad nueva
import type {
  TransactionsResponse,
  Transaction,
  BalanceResponse,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../types';

export const transactionsService = {
  getAll: async (filters?: TransactionFilters) => {
    // 1. Creamos una copia de los filtros para poder modificarla sin romper nada
    // (Casteamos a 'any' momentáneamente para permitir borrar propiedades opcionales sin líos de TS estricto)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paramsToSend: any = { ...filters };

    // 2. LÓGICA DE NEGOCIO:
    // Si el usuario eligió un Rango de Fechas específico, borramos mes y año
    // para que el backend no se confunda.
    if (paramsToSend.startDate && paramsToSend.endDate) {
      delete paramsToSend.month;
      delete paramsToSend.year;
    }

    // 3. Limpiamos propiedades vacías y enviamos
    const response = await api.get<TransactionsResponse>('/transactions', {
      params: filters ? cleanObject(paramsToSend) : {},
    });

    return response.data;
  },

  create: async (data: CreateTransactionDTO) => {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/transactions/${id}`);
  },

  getBalance: async () => {
    const response = await api.get<BalanceResponse>('/transactions/balance');
    return response.data;
  },

  update: async (id: string, data: UpdateTransactionDTO) => {
    const response = await api.patch<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },
};
