import { api } from '../../../lib/axios';
import type { CategoriesResponse } from '../types';

export const categoriesService = {
  getAll: async () => {
    // Pedimos 100 para asegurar que vengan todas en la primera página
    const response = await api.get<CategoriesResponse>('/categories', {
      params: { limit: 100 },
    });

    // Retornamos directamente el array 'data', que es lo que le importa al Dropdown
    return response.data.data;
  },
};
