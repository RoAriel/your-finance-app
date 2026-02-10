import { api } from '@/lib/axios';
import { cleanObject } from '@/utils/api-helpers';

// 1. Interfaces
export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  month: number;
  year: number;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED';
}

export interface CreateBudgetDTO {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetDTO {
  amount: number;
}

export const budgetsService = {
  // Busca presupuestos filtrando por mes y año
  findAll: async (month: number, year: number): Promise<Budget[]> => {
    // 👇 Usamos cleanObject para limpiar y Axios para serializar params
    const response = await api.get<Budget[]>('/budgets', {
      params: cleanObject({ month, year }),
    });
    return response.data;
  },

  create: async (dto: CreateBudgetDTO): Promise<Budget> => {
    const { data } = await api.post<Budget>('/budgets', dto);
    return data;
  },

  update: async (id: string, dto: UpdateBudgetDTO): Promise<Budget> => {
    const { data } = await api.patch<Budget>(`/budgets/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
};
