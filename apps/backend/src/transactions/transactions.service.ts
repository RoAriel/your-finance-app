// src/transactions/transactions.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Transaction } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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
   * Crea una nueva transacción
   */
  async create(dto: CreateTransactionDto, userId: string) {
    this.logger.logOperation('Create transaction', {
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency,
      userId,
    });

    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          ...dto,
          userId,
        },
        include: {
          category: true,
        },
      });

      this.logger.logSuccess('Create transaction', {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
      });

      return transaction;
    } catch (error) {
      this.logger.logFailure('Create transaction', error as Error);
      throw error;
    }
  }

  /**
   * Lista todas las transacciones del usuario con filtros y paginación
   */
  async findAll(
    query: QueryTransactionDto,
    userId: string,
  ): Promise<PaginatedResult<Transaction>> {
    this.logger.log(
      `Finding transactions for user ${userId} with filters: ${JSON.stringify(query)}`,
    );

    const {
      page = 1,
      limit = 20,
      type,
      startDate,
      endDate,
      categoryId,
      currency,
      year,
      month,
      search,
    } = query;

    // Construir filtros
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        // Buscar en la descripción
        {
          description: { contains: search, mode: 'insensitive' },
        },
        // Opcional: Buscar también por el nombre de la categoría
        {
          category: { name: { contains: search, mode: 'insensitive' } },
        },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (currency) {
      where.currency = currency;
    }

    let filterStart = startDate ? new Date(startDate) : undefined;
    let filterEnd = endDate ? new Date(endDate) : undefined;

    // Si no hay fechas explícitas pero sí hay Mes/Año, calculamos el rango
    if (!filterStart && !filterEnd && month && year) {
      filterStart = new Date(year, month - 1, 1);
      filterEnd = new Date(year, month, 0, 23, 59, 59, 999);
    }

    // Aplicamos el filtro si tenemos alguna fecha calculada
    if (filterStart || filterEnd) {
      where.date = {};
      if (filterStart) where.date.gte = filterStart;
      if (filterEnd) where.date.lte = filterEnd;
    }

    // Ejecutar query con paginación
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          include: {
            category: true,
          },
          orderBy: {
            date: 'desc',
          },
        }),
        this.prisma.transaction.count({ where }),
      ]);

      this.logger.log(
        `Found ${data.length} of ${total} transactions for user ${userId}`,
      );

      return createPaginatedResponse<Transaction>(data, total, page, limit);
    } catch (error) {
      this.logger.logFailure('Find all transactions', error as Error);
      throw error;
    }
  }

  /**
   * Calcula el balance del usuario (ingresos - gastos)
   */
  async getBalance(userId: string) {
    this.logger.log(`Calculating balance for user ${userId}`);

    try {
      const [income, expenses] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'income',
            deletedAt: null,
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'expense',
            deletedAt: null,
          },
          _sum: { amount: true },
        }),
      ]);

      const incomeAmount = income._sum.amount ? Number(income._sum.amount) : 0;
      const expensesAmount = expenses._sum.amount
        ? Number(expenses._sum.amount)
        : 0;

      const balance = {
        income: incomeAmount,
        expenses: expensesAmount,
        balance: incomeAmount - expensesAmount,
      };

      this.logger.logSuccess('Calculate balance', {
        income: balance.income,
        expenses: balance.expenses,
        balance: balance.balance,
      });

      return balance;
    } catch (error) {
      this.logger.logFailure('Calculate balance', error as Error);
      throw error;
    }
  }

  /**
   * Obtiene una transacción por ID
   */
  async findOne(id: string, userId: string) {
    this.logger.log(`Finding transaction ${id} for user ${userId}`);

    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      this.logger.warn(`Transaction ${id} not found for user ${userId}`);
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Actualiza una transacción existente
   */
  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    this.logger.logOperation('Update transaction', {
      id,
      updates: dto,
      userId,
    });

    // Verificar que existe y pertenece al usuario
    await this.findOne(id, userId);

    try {
      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: dto,
        include: {
          category: true,
        },
      });

      this.logger.logSuccess('Update transaction', {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
      });

      return transaction;
    } catch (error) {
      this.logger.logFailure('Update transaction', error as Error);
      throw error;
    }
  }

  /**
   * Elimina una transacción (soft delete)
   */
  async remove(id: string, userId: string) {
    this.logger.logOperation('Delete transaction', { id, userId });

    // Verificar que existe y pertenece al usuario
    await this.findOne(id, userId);

    try {
      await this.prisma.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.logSuccess('Delete transaction', { id });

      return { message: 'Transaction deleted successfully' };
    } catch (error) {
      this.logger.logFailure('Delete transaction', error as Error);
      throw error;
    }
  }
}
