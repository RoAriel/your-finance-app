import { api } from '@/lib/axios';
import type { AuthResponse, LoginCredentials, RegisterDto } from '../types'; // 👈 Agregamos RegisterDto
import { logger } from '@/utils/appLogger';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    logger.debug('Intentando iniciar sesión', { email: credentials.email });

    const response = await api.post<AuthResponse>('/auth/login', credentials);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      logger.success('Login exitoso. Token guardado.');
    }

    return response.data;
  },

  // 👇 NUEVO MÉTODO CON LOGGERS
  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    logger.debug('Iniciando registro', {
      email: dto.email,
      firstName: dto.firstName, // 👈 Logueamos datos útiles
      currency: dto.currency,
    });

    // 2. Llamada a la API
    const response = await api.post<AuthResponse>('/auth/register', dto);

    // 3. Log de éxito
    // No guardamos el token aquí porque redirigiremos al Login,
    // pero confirmamos que el proceso terminó bien.

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      logger.success('Registro exitoso. Auto-login activado.', {
        userId: response.data.user.id,
      });
    }

    logger.success('Registro completado con éxito', {
      email: dto.email,
      userId: response.data.user.id,
    });

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    logger.info('Sesión cerrada');
    window.location.href = '/';
  },
};
