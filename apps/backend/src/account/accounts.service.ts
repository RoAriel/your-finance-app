import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AppLogger } from '../common/utils/logger.util';
import { TransferDto } from './dto/transfer.dto';
// Asegúrate de importar TransactionType correctamente
import { TransactionType } from '../transactions/dto/create-transaction.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DepositDto } from './dto/deposit.dto';

@Injectable()
export class AccountsService {
  private readonly logger = new AppLogger(AccountsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAccountDto, userId: string) {
    const operation = 'Crear Cuenta';
    try {
      this.logger.logOperation(operation, { userId, type: dto.type });

      // 👇 Usamos prisma.account
      const account = await this.prisma.account.create({
        data: {
          ...dto,
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
    const operation = 'Listar Cuentas';
    try {
      this.logger.logOperation(operation, { userId });

      // 👇 Usamos prisma.account
      const accounts = await this.prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }, // Orden cronológico
      });

      this.logger.logSuccess(operation, { count: accounts.length });

      // Mapeo para calcular Progreso (útil para SAVINGS)
      return accounts.map((acc) => {
        const balance = Number(acc.balance);
        const targetAmount = acc.targetAmount ? Number(acc.targetAmount) : 0;
        let progress = 0;

        if (targetAmount > 0) {
          progress = Math.min((balance / targetAmount) * 100, 100);
        }

        return {
          ...acc,
          balance, // Convertido a Number
          targetAmount: targetAmount > 0 ? targetAmount : null,
          progress: Math.round(progress),
        };
      });
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async deposit(accountId: string, dto: DepositDto, userId: string) {
    const operation = 'Depositar Fondos';
    const { amount, description } = dto;

    try {
      this.logger.logOperation(operation, { accountId, amount });

      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) throw new NotFoundException('Account not found');
      if (account.userId !== userId)
        throw new ForbiddenException('Not your account');

      const result = await this.prisma.$transaction(async (tx) => {
        // A. Actualizar saldo
        const updatedAccount = await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: amount } },
        });

        // B. Crear Transaction
        await tx.transaction.create({
          data: {
            amount: amount,
            description: description || 'Depósito manual',
            date: new Date(),
            type: TransactionType.INCOME, // Asegúrate que coincida con tu Enum
            userId,
            accountId: accountId, // 👈 CAMBIO CRÍTICO: accountId
            currency: account.currency, // Buena práctica agregar la moneda
          },
        });

        return updatedAccount;
      });

      this.logger.logSuccess(operation, { newBalance: result.balance });
      return result;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async transfer(dto: TransferDto, userId: string) {
    const operation = 'Transferencia';
    const { sourceAccountId, targetAccountId, amount, description } = dto;

    try {
      this.logger.logOperation(operation, dto);

      if (sourceAccountId === targetAccountId) {
        throw new BadRequestException('Cannot transfer to the same account');
      }

      // Validaciones
      const sourceAccount = await this.prisma.account.findUnique({
        where: { id: sourceAccountId },
      });
      const targetAccount = await this.prisma.account.findUnique({
        where: { id: targetAccountId },
      });

      if (!sourceAccount || !targetAccount)
        throw new NotFoundException('Accounts not found');
      if (sourceAccount.userId !== userId)
        throw new ForbiddenException('Not owner of source account');

      // Validar Moneda (Opcional, pero recomendado)
      if (sourceAccount.currency !== targetAccount.currency) {
        throw new BadRequestException('Currency mismatch');
      }

      if (Number(sourceAccount.balance) < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // 🔥 Transacción Atómica
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Restar Origen
        const updatedSource = await tx.account.update({
          where: { id: sourceAccountId },
          data: { balance: { decrement: amount } },
        });

        // 2. Transaction Salida
        await tx.transaction.create({
          data: {
            amount: amount,
            description: `Transferencia a: ${targetAccount.name}`,
            date: new Date(),
            type: TransactionType.TRANSFER_OUT,
            userId,
            accountId: sourceAccountId, // 👈 CAMBIO: accountId
            currency: sourceAccount.currency,
          },
        });

        // 3. Sumar Destino
        const updatedTarget = await tx.account.update({
          where: { id: targetAccountId },
          data: { balance: { increment: amount } },
        });

        // 4. Transaction Entrada
        await tx.transaction.create({
          data: {
            amount: amount,
            description: description
              ? `Recibido: ${description}`
              : `Desde: ${sourceAccount.name}`,
            date: new Date(),
            type: TransactionType.TRANSFER_IN,
            userId,
            accountId: targetAccountId, // 👈 CAMBIO: accountId
            currency: targetAccount.currency,
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

  async remove(userId: string, id: string) {
    // Ojo: cambié el orden de los params para ser consistente si quieres
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) throw new NotFoundException('Account not found');

    if (account.isDefault) {
      throw new BadRequestException('Cannot delete default account');
    }

    return this.prisma.account.delete({
      where: { id },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) throw new NotFoundException('Account not found');

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }
}
