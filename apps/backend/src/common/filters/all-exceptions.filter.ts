import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const rawMessage = (exceptionResponse as any).message;

      if (Array.isArray(rawMessage)) {
        message = rawMessage.join(', '); // "Error 1, Error 2"
      } else if (typeof rawMessage === 'string') {
        message = rawMessage;
      } else {
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
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );

      // En producción, no exponer detalles internos
      if (process.env.NODE_ENV === 'production' && status === 500) {
        errorResponse.message = 'An unexpected error occurred';
      }

      response.status(status).json(errorResponse);
    }
  }
}
