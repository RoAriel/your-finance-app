import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Transaction } from '@prisma/client';
import {
  CreateTransactionDto,
  TransactionType, // 👈 IMPORTANTE: Usamos el Enum del DTO
} from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { AppLogger } from '../common/utils/logger.util';

import {
  PaginatedResult,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new AppLogger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crea una transacción y actualiza el saldo de la cuenta atómicamente
   */
  async create(dto: CreateTransactionDto, userId: string) {
    const { accountId, amount, type, ...rest } = dto;

    this.logger.logOperation('Create transaction', {
      type,
      amount,
      accountId,
      userId,
    });

    // 1. Validar Cuenta
    const account = await this.prisma.savingsAccount.findUnique({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException(
        'Cuenta no encontrada o no pertenece al usuario',
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // A. Crear la transacción
        const newTransaction = await tx.transaction.create({
          data: {
            ...rest,
            amount,
            type, // Aquí entra como 'income' o 'expense' (valores del Enum)
            userId,
            savingsAccountId: accountId, // Mapeo DTO -> Schema
            currency: account.currency,
          },
          include: {
            category: true,
            savingsAccount: true,
          },
        });

        // B. Calcular impacto en el saldo
        // ✅ COMPARACIÓN CORRECTA: Ambos lados son del tipo Enum TransactionType
        const operation =
          type === TransactionType.INCOME ? 'increment' : 'decrement';

        // C. Actualizar la cuenta
        await tx.savingsAccount.update({
          where: { id: accountId },
          data: {
            balance: {
              [operation]: amount,
            },
          },
        });

        return newTransaction;
      });

      this.logger.logSuccess('Create transaction', {
        id: result.id,
        newBalance: result.savingsAccount
          ? Number(result.savingsAccount.balance)
          : 0,
      });

      return result;
    } catch (error) {
      this.logger.logFailure('Create transaction', error as Error);
      throw error;
    }
  }

  /**
   * Lista transacciones con filtros
   */
  async findAll(
    query: QueryTransactionDto,
    userId: string,
  ): Promise<PaginatedResult<Transaction>> {
    const {
      page = 1,
      limit = 20,
      type,
      startDate,
      endDate,
      categoryId,
      accountId, // Este es obligatorio en tu DTO
      year,
      month,
      search,
    } = query;

    this.logger.log(
      `Finding transactions for user ${userId} with filters: ${JSON.stringify(query)}`,
    );

    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
    };

    // Mapeo de filtros
    if (accountId) where.savingsAccountId = accountId;
    // TypeScript permite asignar el Enum al String de Prisma porque los valores coinciden
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    let filterStart = startDate ? new Date(startDate) : undefined;
    let filterEnd = endDate ? new Date(endDate) : undefined;

    if (!filterStart && !filterEnd && month && year) {
      filterStart = new Date(year, month - 1, 1);
      filterEnd = new Date(year, month, 0, 23, 59, 59, 999);
    }

    if (filterStart || filterEnd) {
      where.date = {};
      if (filterStart) where.date.gte = filterStart;
      if (filterEnd) where.date.lte = filterEnd;
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          include: {
            category: true,
            savingsAccount: true,
          },
          orderBy: { date: 'desc' },
        }),
        this.prisma.transaction.count({ where }),
      ]);

      this.logger.logSuccess('Find transactions', {
        count: data.length,
        total,
      });

      return createPaginatedResponse<Transaction>(data, total, page, limit);
    } catch (error) {
      this.logger.logFailure('Find all transactions', error as Error);
      throw error;
    }
  }

  /**
   * Calcula el balance global
   */
  async getBalance(userId: string) {
    this.logger.log(`Calculating global balance for user ${userId}`);

    try {
      const accounts = await this.prisma.savingsAccount.findMany({
        where: { userId },
        select: { balance: true, currency: true },
      });

      const balanceByCurrency: Record<string, number> = {};

      accounts.forEach((acc) => {
        const amount = Number(acc.balance);
        if (!balanceByCurrency[acc.currency]) {
          balanceByCurrency[acc.currency] = 0;
        }
        balanceByCurrency[acc.currency] += amount;
      });

      this.logger.logSuccess('Calculate balance', { balanceByCurrency });

      return {
        netWorth: balanceByCurrency,
      };
    } catch (error) {
      this.logger.logFailure('Calculate balance', error as Error);
      throw error;
    }
  }

  /**
   * Actualiza transacción y reajusta saldos
   */
  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    this.logger.logOperation('Update transaction', { id, userId });

    const oldTransaction = await this.findOne(id, userId);

    if (!oldTransaction.savingsAccountId) {
      throw new BadRequestException(
        'La transacción original no tiene una cuenta asociada válida.',
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. REVERTIR el impacto anterior
        // ✅ TRUCO LIMPIO: Casteamos el valor de la BD (string) al Enum para compararlo
        const oldType = oldTransaction.type as TransactionType;
        const reverseOp =
          oldType === TransactionType.INCOME ? 'decrement' : 'increment';

        await tx.savingsAccount.update({
          where: { id: oldTransaction.savingsAccountId! },
          data: { balance: { [reverseOp]: oldTransaction.amount } },
        });

        // 2. APLICAR nueva transacción
        const newAmount =
          dto.amount !== undefined ? dto.amount : oldTransaction.amount;
        // Si viene tipo nuevo lo usamos, si no, casteamos el viejo
        const newType = dto.type
          ? dto.type
          : (oldTransaction.type as TransactionType);

        const newAccountId = dto.accountId || oldTransaction.savingsAccountId!;

        // Cambio de cuenta
        if (
          dto.accountId &&
          dto.accountId !== oldTransaction.savingsAccountId
        ) {
          const newAccount = await tx.savingsAccount.findUnique({
            where: { id: dto.accountId, userId },
          });
          if (!newAccount)
            throw new NotFoundException('Nueva cuenta no encontrada');
        }

        const applyOp =
          newType === TransactionType.INCOME ? 'increment' : 'decrement';

        await tx.savingsAccount.update({
          where: { id: newAccountId },
          data: { balance: { [applyOp]: newAmount } },
        });

        // 3. Actualizar registro
        return tx.transaction.update({
          where: { id },
          data: {
            ...dto,
            savingsAccountId: dto.accountId, // Mapeo DTO -> Schema
          },
          include: { category: true },
        });
      });

      this.logger.logSuccess('Update transaction', { id: result.id });
      return result;
    } catch (error) {
      this.logger.logFailure('Update transaction', error as Error);
      throw error;
    }
  }

  /**
   * Elimina y revierte saldo
   */
  async remove(id: string, userId: string) {
    this.logger.logOperation('Delete transaction', { id, userId });

    const transaction = await this.findOne(id, userId);

    if (!transaction.savingsAccountId) {
      throw new BadRequestException(
        'La transacción no tiene una cuenta asociada para revertir el saldo.',
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Revertir saldo
        // ✅ TRUCO LIMPIO: Casteamos DB String -> Enum
        const typeEnum = transaction.type as TransactionType;
        const operation =
          typeEnum === TransactionType.INCOME ? 'decrement' : 'increment';

        await tx.savingsAccount.update({
          where: { id: transaction.savingsAccountId! },
          data: {
            balance: { [operation]: transaction.amount },
          },
        });

        // 2. Soft Delete
        await tx.transaction.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      });

      this.logger.logSuccess('Delete transaction', { id });
      return {
        message: 'Transaction deleted and balance restored successfully',
      };
    } catch (error) {
      this.logger.logFailure('Delete transaction', error as Error);
      throw error;
    }
  }

  private async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
