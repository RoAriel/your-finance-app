// src/common/filters/prisma-exception.filter.ts

import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * Filtro para convertir errores de Prisma en respuestas HTTP amigables
 *
 * Códigos de error de Prisma más comunes:
 * - P2002: Unique constraint violation (email duplicado, etc.)
 * - P2025: Record not found
 * - P2003: Foreign key constraint failed
 * - P2001: Record does not exist
 * - P2014: Invalid ID
 *
 * Documentación: https://www.prisma.io/docs/reference/api-reference/error-reference
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Mapear códigos de error de Prisma a códigos HTTP
    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const targets = exception.meta?.target as string[] | undefined;
        message = targets
          ? `A record with this ${targets.join(', ')} already exists`
          : 'This record already exists';
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;

      case 'P2003':
        // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        const fieldName = exception.meta?.field_name as string | undefined;
        message = fieldName
          ? `Invalid reference: ${fieldName} does not exist`
          : 'Invalid reference to related record';
        break;

      case 'P2001':
        // Record does not exist
        status = HttpStatus.NOT_FOUND;
        message = 'The requested record does not exist';
        break;

      case 'P2014':
        // Invalid ID
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid ID provided';
        break;

      case 'P2011':
        // Null constraint violation
        status = HttpStatus.BAD_REQUEST;
        const nullField = exception.meta?.target as string | undefined;
        message = nullField
          ? `${nullField} cannot be null`
          : 'A required field is missing';
        break;

      default:
        // Error desconocido de Prisma
        message = exception.message;
        this.logger.error(
          `Unhandled Prisma Error Code: ${exception.code}`,
          exception.stack,
        );
    }

    // Construir respuesta
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: `Prisma Error: ${exception.code}`,
    };

    // Loguear el error
    this.logger.error(
      `Prisma ${exception.code} - ${request.method} ${request.url}`,
      JSON.stringify({
        message,
        meta: exception.meta,
        body: request.body,
      }),
    );

    response.status(status).json(errorResponse);
  }
}
