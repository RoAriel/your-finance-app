import { api } from '../../../lib/axios';
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types';
import type { PaginatedResponse } from '../../../types';

interface CategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown; // Permite otros filtros opcionales
}

export const categoriesService = {
  // 1. 👇 Aquí está la magia. Definimos el retorno explícito.
  getAll: async (
    params?: CategoryParams
  ): Promise<PaginatedResponse<Category>> => {
    // Le decimos a Axios que el cuerpo de la respuesta tiene esa forma
    const { data } = await api.get<PaginatedResponse<Category>>('/categories', {
      params,
    });

    return data;
  },

  create: async (data: CreateCategoryDTO) => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryDTO) => {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};
