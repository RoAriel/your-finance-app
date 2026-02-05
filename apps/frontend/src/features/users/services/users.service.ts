import { api } from '../../../lib/axios';

// Definimos la interfaz basada en tu User del AuthContext
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string; // Opcional
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  // currency?: string; // Tu controller lo menciona, lo dejamos preparado
}

export const usersService = {
  getProfile: async (): Promise<UserProfile> => {
    // 👇 Usamos tu ruta correcta
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
  },

  updateProfile: async (dto: UpdateUserDto): Promise<UserProfile> => {
    // 👇 Usamos tu ruta correcta
    const { data } = await api.patch<UserProfile>('/users/me', dto);
    return data;
  },
};
