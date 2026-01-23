// apps/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Habilitar CORS (si lo necesitás para frontend)
  app.enableCors();

  // Validación global de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Rechazar requests con propiedades extra
      transform: true, // Transformar payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Convertir tipos automáticamente
      },
    }),
  );

  // --- CONFIGURACIÓN SWAGGER INICIO ---
  const config = new DocumentBuilder()
    .setTitle('Your Finance App API')
    .setDescription('Documentación para la API de finanzas personales')
    .setVersion('1.0')
    .addBearerAuth() // <--- Habilita el botón para meter el JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // La URL será /docs
  // --- CONFIGURACIÓN SWAGGER FIN ---

  // Exception Filters - ORDEN IMPORTANTE: de más específico a más general
  // 1. Primero se intenta con HttpExceptionFilter (errores HTTP de NestJS)
  // 2. Luego con PrismaExceptionFilter (errores de base de datos)
  // 3. Finalmente con AllExceptionsFilter (cualquier otro error)
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
    new AllExceptionsFilter(),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API endpoints available at: http://localhost:${port}/api`);
}

void bootstrap();
