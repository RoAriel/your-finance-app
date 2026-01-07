import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implementar métodos mañana
  // create()
  // findAll()
  // findOne()
  // update()
  // remove()
}
