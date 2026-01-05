import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // 👈 Importar

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {} // 👈 Inyección de dependencias

  getHello(): string {
    return 'Hello World!';
  }

  // 👇 Nuevo método
  async getUsers() {
    return this.prisma.user.findMany();
  }
}
