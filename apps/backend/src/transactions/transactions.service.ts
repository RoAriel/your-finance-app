import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Transaction } from '@prisma/client';
import {
  CreateTransactionDto,
  TransactionType,
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

  async create(dto: CreateTransactionDto, userId: string) {
    const { accountId, categoryId, amount, type, ...rest } = dto;

    this.logger.logOperation('Create transaction', {
      type,
      amount,
      accountId,
      userId,
    });

    // 1. Validar Cuenta
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException(
        'Cuenta no encontrada o no pertenece al usuario',
      );
    }

    // 🛑 FIX CRÍTICO: VALIDACIÓN DE FONDOS (OVERDRAFT PROTECTION)
    // Si es GASTO o TRANSFERENCIA, verificamos que tenga saldo suficiente.
    if (type === TransactionType.EXPENSE || type === TransactionType.TRANSFER) {
      const currentBalance = Number(account.balance);
      if (currentBalance < amount) {
        throw new BadRequestException(
          `Fondos insuficientes. Tu saldo es $${currentBalance.toFixed(2)} y intentas gastar $${amount.toFixed(2)}`,
        );
      }
    }

    // 🔒 Validación de Moneda Estricta
    if (dto.currency && dto.currency !== account.currency) {
      throw new BadRequestException(
        `No puedes crear una transacción en ${dto.currency} en una cuenta configurada en ${account.currency}.`,
      );
    }

    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) throw new NotFoundException('Categoría no encontrada');

      if (category.userId !== userId)
        throw new BadRequestException('Categoría inválida');

      // Validación de coherencia
      const catTypeStr = category.type;
      const transTypeStr = type as string;

      if (catTypeStr !== 'BOTH' && catTypeStr !== transTypeStr) {
        throw new BadRequestException(
          `No puedes crear una transacción de tipo ${type} con una categoría de tipo ${category.type}`,
        );
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // A. Crear
        const newTransaction = await tx.transaction.create({
          data: {
            ...rest,
            amount,
            type,
            userId,
            accountId,
            currency: account.currency,
            categoryId: categoryId || undefined,
          },
          // ✅ FIX: Incluimos relaciones al crear
          include: {
            category: true,
            account: true,
          },
        });

        // B. Calcular impacto
        const operation =
          type === TransactionType.INCOME ? 'increment' : 'decrement';

        // C. Actualizar cuenta
        await tx.account.update({
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
        newBalance: Number(result.account?.balance || 0),
      });

      return result;
    } catch (error) {
      this.logger.logFailure('Create transaction', error as Error);
      throw error;
    }
  }

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
      accountId,
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

    if (accountId) where.accountId = accountId;
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
            account: true,
          },
          orderBy: { date: 'desc' },
        }),
        this.prisma.transaction.count({ where }),
      ]);

      return createPaginatedResponse<Transaction>(data, total, page, limit);
    } catch (error) {
      this.logger.logFailure('Find all transactions', error as Error);
      throw error;
    }
  }

  async getBalance(userId: string) {
    this.logger.log(`Calculating global balance for user ${userId}`);

    try {
      const accounts = await this.prisma.account.findMany({
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

      return {
        netWorth: balanceByCurrency,
      };
    } catch (error) {
      this.logger.logFailure('Calculate balance', error as Error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    this.logger.logOperation('Update transaction', { id, userId });

    const oldTransaction = await this.findOne(id, userId);

    if (!oldTransaction.accountId) {
      throw new BadRequestException(
        'La transacción original no tiene cuenta válida.',
      );
    }

    // Validar Coherencia
    const targetCategoryId = dto.categoryId ?? oldTransaction.categoryId;
    const targetType = dto.type ?? oldTransaction.type;

    if (targetCategoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: targetCategoryId },
      });
      if (category) {
        const catTypeStr = category.type;
        const transTypeStr = targetType;

        if (catTypeStr !== 'BOTH' && catTypeStr !== transTypeStr) {
          throw new BadRequestException(
            `Incoherencia: Categoría es ${catTypeStr} pero transacción es ${transTypeStr}`,
          );
        }
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // A. REVERTIR
        const oldTypeStr = oldTransaction.type;
        const reverseOp = oldTypeStr === 'INCOME' ? 'decrement' : 'increment';

        await tx.account.update({
          where: { id: oldTransaction.accountId! },
          data: { balance: { [reverseOp]: oldTransaction.amount } },
        });

        // B. PREPARAR
        const newAmount =
          dto.amount !== undefined ? dto.amount : oldTransaction.amount;
        const newType = dto.type ? dto.type : oldTransaction.type;
        const newAccountId = dto.accountId || oldTransaction.accountId!;

        // Cambio de cuenta
        if (dto.accountId && dto.accountId !== oldTransaction.accountId) {
          const newAccount = await tx.account.findFirst({
            where: { id: dto.accountId, userId },
          });
          if (!newAccount)
            throw new NotFoundException('Nueva cuenta no encontrada');
        }

        // C. APLICAR
        const newTypeStr = newType;
        const applyOp = newTypeStr === 'INCOME' ? 'increment' : 'decrement';

        await tx.account.update({
          where: { id: newAccountId },
          data: { balance: { [applyOp]: newAmount } },
        });

        // D. Actualizar registro
        return tx.transaction.update({
          where: { id },
          data: {
            ...dto,
            accountId: newAccountId,
            type: newType,
          },
          include: {
            category: true,
            account: true,
          },
        });
      });

      this.logger.logSuccess('Update transaction', { id: result.id });
      return result;
    } catch (error) {
      this.logger.logFailure('Update transaction', error as Error);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    this.logger.logOperation('Delete transaction', { id, userId });

    const transaction = await this.findOne(id, userId);

    if (!transaction.accountId) {
      throw new BadRequestException('Transacción sin cuenta asociada.');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const typeStr = transaction.type;
        const operation = typeStr === 'INCOME' ? 'decrement' : 'increment';

        await tx.account.update({
          where: { id: transaction.accountId! },
          data: {
            balance: { [operation]: transaction.amount },
          },
        });

        await tx.transaction.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      });

      this.logger.logSuccess('Delete transaction', { id });
      return { message: 'Transacción eliminada y saldo restaurado.' };
    } catch (error) {
      this.logger.logFailure('Delete transaction', error as Error);
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: true,
        account: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
