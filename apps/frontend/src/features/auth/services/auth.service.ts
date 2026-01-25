// apps/frontend/src/features/auth/services/auth.service.ts
import { api } from '../../../lib/axios';
import type { AuthResponse, LoginCredentials } from '../types';
import { logger } from '../../../utils/appLogger';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    logger.debug('Intentando iniciar sesión', { email: credentials.email });
    
    // Llamada al endpoint definido en tu documentacion
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Guardamos el token para que el interceptor de Axios lo tome automáticamente
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      logger.success('Login exitoso. Token guardado.');
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    logger.info('Sesión cerrada');
    // Aquí podríamos recargar la página o redirigir
    window.location.href = '/'; 
  }
};