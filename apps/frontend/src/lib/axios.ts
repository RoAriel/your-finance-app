import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { logger } from '../utils/appLogger';

// 1. Configurar URL base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Aseguramos que termine en /api si no lo tiene (ajusta según tu backend)
const baseURL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

console.log('🔗 API URL configurada:', baseURL);

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// 2. Interceptor de REQUEST (Salida)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
api.interceptors.response.use(
  (response) => {
    logger.debug(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    // A. Error con respuesta del servidor
    if (error.response) {
      const status = error.response.status;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = error.response.data as any;

      logger.error(`❌ API Error [${status}]`, data);

      // 👇 AQUÍ ESTÁ LA MAGIA DE SEGURIDAD
      if (status === 401) {
        logger.warn('Sesión expirada. Cerrando sesión...');

        // 1. Limpiamos el token corrupto/vencido
        localStorage.removeItem('token');

        // 2. Redirigimos al login (Fuerza bruta necesaria fuera de componentes React)
        // Evitamos bucle infinito si ya estamos en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?error=session_expired';
        }
      }
    }
    // B. Error de red (sin respuesta)
    else if (error.request) {
      logger.error(
        'Sin respuesta del servidor. Verifica tu conexión.',
        error.request
      );
    }
    // C. Error de configuración
    else {
      logger.error('Error desconocido', error.message);
    }

    return Promise.reject(error);
  }
);
