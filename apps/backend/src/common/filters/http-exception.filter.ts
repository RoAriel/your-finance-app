// src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global para manejar todas las excepciones HTTP de NestJS
 *
 * Captura errores como:
 * - BadRequestException (400)
 * - UnauthorizedException (401)
 * - NotFoundException (404)
 * - ConflictException (409)
 * - etc.
 *
 * Retorna un formato JSON consistente y loguea el error
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extraer el mensaje del error
    let message: string | string[];
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      message = (exceptionResponse as { message: string | string[] }).message;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      message = exception.message;
    }

    // Construir la respuesta de error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // Loguear el error
    this.logger.error(
      `HTTP ${status} Error - ${request.method} ${request.url}`,
      JSON.stringify({
        message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: request.body,
        params: request.params,
        query: request.query,
      }),
    );

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }
}
