import { api } from '../../../lib/axios';

// 1. Interfaces
export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
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
    const params = new URLSearchParams();
    params.append('month', month.toString());
    params.append('year', year.toString());

    const { data } = await api.get<Budget[]>(`/budgets?${params.toString()}`);
    return data;
  },

  create: async (dto: CreateBudgetDTO): Promise<Budget> => {
    const { data } = await api.post<Budget>('/budgets', dto);
    return data;
  },

  // CORREGIDO: Ahora recibe el DTO completo, no solo el número
  update: async (id: string, dto: UpdateBudgetDTO): Promise<Budget> => {
    const { data } = await api.patch<Budget>(`/budgets/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
};
