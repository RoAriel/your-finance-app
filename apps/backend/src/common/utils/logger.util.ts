import { Logger, LogLevel } from '@nestjs/common';

export class AppLogger extends Logger {
  /**
   * Log de nivel ERROR - Para errores que requieren atención
   */
  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || this.context);
  }

  /**
   * Log de nivel WARN - Para situaciones anómalas que no son errores
   */
  warn(message: string, context?: string) {
    super.warn(message, context || this.context);
  }

  /**
   * Log de nivel LOG - Para operaciones importantes
   */
  log(message: string, context?: string) {
    super.log(message, context || this.context);
  }

  /**
   * Log de nivel DEBUG - Para debugging detallado
   */
  debug(message: string, context?: string) {
    super.debug(message, context || this.context);
  }

  /**
   * Log de nivel VERBOSE - Para información muy detallada
   */
  verbose(message: string, context?: string) {
    super.verbose(message, context || this.context);
  }

  /**
   * Log de inicio de operación con datos
   */
  logOperation(operation: string, data?: any) {
    const message = data
      ? `${operation} - Data: ${JSON.stringify(data)}`
      : operation;
    this.log(message);
  }

  /**
   * Log de operación exitosa
   */
  logSuccess(operation: string, result?: any) {
    const message = result
      ? `✓ ${operation} - Success: ${JSON.stringify(result)}`
      : `✓ ${operation} - Success`;
    this.log(message);
  }

  /**
   * Log de operación fallida
   */
  logFailure(operation: string, error: Error) {
    this.error(`✗ ${operation} - Failed: ${error.message}`, error.stack);
  }
}
