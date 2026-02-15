import { api } from '@/lib/axios';
import { UserRole } from '../../auth/types';

// Definimos la interfaz basada en tu User del AuthContext
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  currency: string;
  role: UserRole; // Asegúrate de que tu backend incluya el rol en la respuesta del perfil
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  currency?: string; // Tu controller lo menciona, lo dejamos preparado
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
