import { api } from '../../../lib/axios';
import type { Account, CreateAccountDTO, UpdateAccountDTO } from '../types';

export interface TransferDTO {
  sourceAccountId: string;
  targetAccountId: string;
  amount: number;
  description?: string;
  date: string; // Importante para el historial
}

export const accountsService = {
  // Trae TODAS las cuentas. El filtrado visual lo haremos en el hook o componente.
  getAll: async (): Promise<Account[]> => {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },

  getById: async (id: string): Promise<Account> => {
    const { data } = await api.get<Account>(`/accounts/${id}`);
    return data;
  },

  create: async (dto: CreateAccountDTO): Promise<Account> => {
    const { data } = await api.post<Account>('/accounts', dto);
    return data;
  },

  update: async (id: string, dto: UpdateAccountDTO): Promise<Account> => {
    const { data } = await api.patch<Account>(`/accounts/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },

  transfer: async (dto: TransferDTO): Promise<void> => {
    await api.post('/accounts/transfer', dto);
  },
};
