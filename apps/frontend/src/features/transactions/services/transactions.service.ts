import { api } from '../../../lib/axios';
import type { TransactionsResponse } from '../types';

export const transactionsService = {
  getAll: async (page = 1, limit = 10) => {
    // Pasamos los params en la URL para que el backend pagine
    const response = await api.get<TransactionsResponse>('/transactions', {
      params: { page, limit },
    });

    return response.data;
    // Esto retorna { data: [...], meta: {...} }
  },
};
