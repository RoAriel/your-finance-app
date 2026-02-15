import { api } from '@/lib/axios';
import type { User } from '@/features/auth/types';

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/admin/users');
    return data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  resetPassword: async (userId: string, password: string): Promise<void> => {
    await api.patch(`/admin/users/${userId}/password`, { password });
  },
};
