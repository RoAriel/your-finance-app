import { api } from '../../../lib/axios';
import type { TransactionsResponse, Transaction } from '../types';

// Definimos qué datos necesitamos para crear (sin ID, ni fechas, eso lo pone el back)
export interface CreateTransactionDTO {
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO format
  type: 'income' | 'expense' | 'bouth' | 'transfer';
  currency: string;
}

export const transactionsService = {
  getAll: async (page = 1, limit = 10) => {
    // Pasamos los params en la URL para que el backend pagine
    const response = await api.get<TransactionsResponse>('/transactions', {
      params: { page, limit },
    });

    return response.data;
    // Esto retorna { data: [...], meta: {...} }
  },

  create: async (data: CreateTransactionDTO) => {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  delete: async (id: string) => {
    // Asumiendo que tu backend usa DELETE /transactions/:id
    await api.delete(`/transactions/${id}`);
  },
};
