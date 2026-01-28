import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSavingsAccountDto } from './dto/create-saving.dto';
import { AppLogger } from '../common/utils/logger.util';
import { TransferDto } from './dto/transfer.dto';
import { TransactionType } from '../transactions/dto/create-transaction.dto';

@Injectable()
export class SavingsService {
  private readonly logger = new AppLogger(SavingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSavingsDto: CreateSavingsAccountDto, userId: string) {
    const operation = 'Crear Cuenta de Ahorro';

    try {
      this.logger.logOperation(operation, {
        userId,
        currency: createSavingsDto.currency,
      });

      const account = await this.prisma.savingsAccount.create({
        data: {
          ...createSavingsDto,
          userId,
          balance: 0,
        },
      });

      this.logger.logSuccess(operation, { id: account.id });

      return account;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);

      throw error;
    }
  }

  async findAll(userId: string) {
    const operation = 'Listar Cuentas de Usuario';

    try {
      this.logger.logOperation(operation, { userId });

      const accounts = await this.prisma.savingsAccount.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      this.logger.logSuccess(operation, { count: accounts.length });

      // 👇 Mapeo para calcular Progreso y limpiar tipos Decimal
      return accounts.map((acc) => {
        const balance = Number(acc.balance);
        const targetAmount = acc.targetAmount ? Number(acc.targetAmount) : 0;
        let progress = 0;

        // Solo calculamos progreso si hay una meta real
        if (targetAmount > 0) {
          progress = Math.min((balance / targetAmount) * 100, 100); // Tope 100%
        }

        return {
          ...acc,
          // Sobrescribimos con Number para facilitar uso en Frontend
          balance,
          targetAmount: targetAmount > 0 ? targetAmount : null,
          // Campo virtual nuevo
          progress: Math.round(progress),
        };
      });
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async deposit(accountId: string, amount: number, userId: string) {
    const operation = 'Depositar Fondos';
    try {
      this.logger.logOperation(operation, { accountId, amount });

      // Verificar que la cuenta existe y es mía
      const account = await this.prisma.savingsAccount.findUnique({
        where: { id: accountId },
      });
      if (!account) throw new NotFoundException('Account not found');
      if (account.userId !== userId)
        throw new ForbiddenException('Not your account');

      // Actualizar saldo
      const updated = await this.prisma.savingsAccount.update({
        where: { id: accountId },
        data: { balance: { increment: amount } }, // Prisma hace la suma mágica
      });

      this.logger.logSuccess(operation, { newBalance: updated.balance });
      return updated;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async transfer(dto: TransferDto, userId: string) {
    const operation = 'Transferencia entre Cuentas';
    const { sourceAccountId, targetAccountId, amount } = dto;

    try {
      this.logger.logOperation(operation, dto);

      if (sourceAccountId === targetAccountId) {
        throw new BadRequestException('Cannot transfer to the same account');
      }

      // Validaciones previas (lectura)
      const sourceAccount = await this.prisma.savingsAccount.findUnique({
        where: { id: sourceAccountId },
      });
      const targetAccount = await this.prisma.savingsAccount.findUnique({
        where: { id: targetAccountId },
      });

      if (!sourceAccount || !targetAccount)
        throw new NotFoundException('One or more accounts not found');

      // Validar propiedad (solo puedo sacar dinero de MIS cuentas)
      if (sourceAccount.userId !== userId)
        throw new ForbiddenException('You do not own the source account');

      // Validar misma moneda (Complejidad reducida por ahora)
      if (sourceAccount.currency !== targetAccount.currency) {
        throw new BadRequestException(
          `Currency mismatch: Cannot transfer from ${sourceAccount.currency} to ${targetAccount.currency}`,
        );
      }

      // Validar Saldo
      if (Number(sourceAccount.balance) < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // 🔥 AQUÍ OCURRE LA MAGIA: PRISMA TRANSACTION
      // Todo lo que ocurra aquí dentro es "Todo o Nada"
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Restar del origen
        const updatedSource = await tx.savingsAccount.update({
          where: { id: sourceAccountId },
          data: { balance: { decrement: amount } },
        });

        // 2. Registrar el GASTO en la cuenta origen (Create Transaction)
        await tx.transaction.create({
          data: {
            amount: amount,
            description: `Transferencia enviada a cuenta destino`,
            date: new Date(),
            type: TransactionType.TRANSFER_OUT, // O 'TRANSFER_OUT' si prefieres
            userId,
            savingsAccountId: sourceAccountId,
            // categoryId: ... podrías asignar una categoría "Transferencias" por defecto si quieres
          },
        });
        // 3. Sumar al destino
        const updatedTarget = await tx.savingsAccount.update({
          where: { id: targetAccountId },
          data: { balance: { increment: amount } },
        });

        // 4. Registrar el INGRESO en la cuenta destino (Create Transaction)
        await tx.transaction.create({
          data: {
            amount: amount,
            description: `Transferencia recibida de cuenta origen`,
            date: new Date(),
            type: TransactionType.TRANSFER_IN, // O 'TRANSFER_IN'
            userId,
            savingsAccountId: targetAccountId,
          },
        });
        return { source: updatedSource, target: updatedTarget };
      });

      this.logger.logSuccess(operation, { amount });

      return result;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }
}
