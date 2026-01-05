import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect(); // Abre la conexión a PostgreSQL
    console.log('✅ Conectado a la base de datos');
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Cierra la conexión limpiamente
    console.log('👋 Desconectado de la base de datos');
  }
}
