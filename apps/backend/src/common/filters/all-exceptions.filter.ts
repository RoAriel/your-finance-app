// src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro catch-all para manejar CUALQUIER excepción no capturada
 *
 * Este filtro actúa como red de seguridad final.
 * Si un error no fue manejado por HttpExceptionFilter ni PrismaExceptionFilter,
 * será capturado aquí.
 *
 * Esto previene que la aplicación crashee por errores inesperados.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determinar mensaje
    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Construir respuesta
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // Loguear el error con stack trace completo
    this.logger.error(
      `Unhandled Exception - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // En producción, no exponer detalles internos
    if (process.env.NODE_ENV === 'production' && status === 500) {
      errorResponse.message = 'An unexpected error occurred';
    }

    response.status(status).json(errorResponse);
  }
}
