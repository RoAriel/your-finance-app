import { api } from '../../../lib/axios';
import type { TransferDto } from '../types';
import type { CreateSavingsDto, DepositDto, SavingsGoal } from '../types';

export const savingsService = {
  // Listar todas
  getAll: async () => {
    const { data } = await api.get<SavingsGoal[]>('/savings');
    return data;
  },

  // Crear nueva meta
  create: async (dto: CreateSavingsDto) => {
    const { data } = await api.post<SavingsGoal>('/savings', dto);
    return data;
  },

  // Depositar dinero (Endpoint: POST /savings/:id/deposit)
  deposit: async (id: string, dto: DepositDto) => {
    const { data } = await api.post<SavingsGoal>(`/savings/${id}/deposit`, dto);
    return data;
  },
  transfer: async (dto: TransferDto) => {
    // Asumo que tu endpoint es POST /savings/transfer (confirma si es diferente)
    const { data } = await api.post('/savings/transfer', dto);
    return data;
  },
  // Eliminar
  delete: async (id: string) => {
    await api.delete(`/savings/${id}`);
  },
};
