import { api } from '../../../lib/axios';
import type {
  TransactionsResponse,
  Transaction,
  BalanceResponse,
  CreateTransactionDTO, // <--- Importar
  UpdateTransactionDTO,
  TransactionFilters,
} from '../types';

// Definimos qué datos necesitamos para crear (sin ID, ni fechas, eso lo pone el back)

export const transactionsService = {
  getAll: async (filters?: TransactionFilters) => {
    // Pasamos los params en la URL para que el backend pagine
    const response = await api.get<TransactionsResponse>('/transactions', {
      params: filters,
    });
    return response.data;
  },

  create: async (data: CreateTransactionDTO) => {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  delete: async (id: string) => {
    // Asumiendo que tu backend usa DELETE /transactions/:id
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
