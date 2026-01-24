type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

const APP_PREFIX = '[YourFinance]';

/**
 * Logger centralizado para la aplicación.
 * En desarrollo: Muestra logs coloridos en consola.
 * En producción: Podría filtrar debugs o enviar errores a Sentry/Datadog.
 */
export const appLogger = (level: LogLevel, message: string, data?: unknown) => {
  // En React/Vite usamos import.meta.env para saber el entorno
  const isDev = import.meta.env.DEV;

  if (!isDev && level === 'debug') return; // Silenciar debug en producción

  const timestamp = new Date().toLocaleTimeString();
  const tag = `${APP_PREFIX} ${timestamp}`;

  switch (level) {
    case 'info':
      console.info(`%c${tag} ℹ️ ${message}`, 'color: #3b82f6; font-weight: bold;', data || '');
      break;
    case 'success': // Agrego un nivel 'success' visual
         console.log(`%c${tag} ✅ ${message}`, 'color: #10b981; font-weight: bold;', data || '');
         break;
    case 'warn':
      console.warn(`%c${tag} ⚠️ ${message}`, 'color: #f59e0b; font-weight: bold;', data || '');
      break;
    case 'error':
      console.error(`%c${tag} 🚨 ${message}`, 'color: #ef4444; font-weight: bold;', data || '');
      break;
    case 'debug':
      console.debug(`%c${tag} 🐛`, 'color: #ec4899;', message, data || '');
      break;
  }
};

// Sobrecarga para facilitar el uso (alias)
export const logger = {
  info: (msg: string, data?: unknown) => appLogger('info', msg, data),
  success: (msg: string, data?: unknown) => appLogger('success' as LogLevel, msg, data), // Hack de tipado seguro
  warn: (msg: string, data?: unknown) => appLogger('warn', msg, data),
  error: (msg: string, data?: unknown) => appLogger('error', msg, data),
  debug: (msg: string, data?: unknown) => appLogger('debug', msg, data),
};