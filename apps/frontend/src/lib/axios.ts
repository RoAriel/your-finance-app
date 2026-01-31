import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { logger } from '../utils/appLogger';
console.log('🔗 API URL configurada:', import.meta.env.VITE_API_URL);
// 1. Crear instancia base
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout de 10 segundos para no dejar la UI colgada eternamente
  timeout: 30000,
});

// 2. Interceptor de REQUEST (Salida)
// Se ejecuta ANTES de que la petición salga hacia el backend
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Aquí recuperaremos el token (más adelante lo conectaremos con AuthStore)
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('Error configurando request', error);
    return Promise.reject(error);
  }
);

// 3. Interceptor de RESPONSE (Entrada)
// Se ejecuta cuando el backend responde
api.interceptors.response.use(
  (response) => {
    logger.debug(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    // Manejo global de errores
    if (error.response) {
      // El servidor respondió con un código de error (4xx, 5xx)
      const status = error.response.status;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = error.response.data as any;

      logger.error(`❌ API Error [${status}]`, data);

      if (status === 401) {
        logger.warn(
          'Sesión expirada o token inválido. Redirigiendo a login...'
        );
        // TODO: Aquí dispararemos el logout automático más adelante
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta (Backend caído o sin internet)
      logger.error(
        'Sin respuesta del servidor. Verifica tu conexión.',
        error.request
      );
    } else {
      logger.error('Error desconocido', error.message);
    }

    return Promise.reject(error);
  }
);
