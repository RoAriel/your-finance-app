import { api } from '@/lib/axios';
import { cleanObject } from '@/utils/api-helpers';

// 1. Interfaces Actualizadas
export interface Budget {
  id?: string; // Opcional (puede ser una categoría sin presupuesto explícito)
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;

  categoryType: 'INCOME' | 'EXPENSE';

  month: number;
  year: number;

  // Valores Monetarios (Calculados por el Backend)
  amount: number; // Límite asignado
  spent: number; // Gasto Total (Incluye hijos recursivamente)
  directSpent: number; // Gasto directo de esta categoría
  remaining: number; // amount - spent

  // Estado Visual
  percentage: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED' | 'UNBUDGETED';

  // 🔄 Recursividad: Array de hijos del mismo tipo
  children: Budget[];
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
  findAll: async (month: number, year: number): Promise<Budget[]> => {
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
