import { api } from '../../../lib/axios';
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types';

export const categoriesService = {
  getAll: async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
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
