import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)  // Todas las rutas protegidas
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // TODO: Implementar endpoints mañana
  // POST /transactions - Crear transacción
  // GET /transactions - Listar transacciones
  // GET /transactions/:id - Ver una transacción
  // PATCH /transactions/:id - Actualizar transacción
  // DELETE /transactions/:id - Eliminar (soft delete)
}
