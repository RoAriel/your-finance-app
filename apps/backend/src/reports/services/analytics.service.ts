import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../common/utils/logger.util';
import { TransactionType, Prisma } from '@prisma/client'; // 👈 Importamos Prisma para tipos

@Injectable()
export class AnalyticsService {
  private readonly logger = new AppLogger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 👇 1. Aceptamos accountId opcional
  async getDashboardStats(userId: string, accountId?: string) {
    this.logger.logOperation('Get Dashboard Analytics', { userId, accountId });

    // --- Lógica existente de exclusión de transferencias ---
    const transferCategories = await this.prisma.category.findMany({
      where: {
        userId,
        name: { contains: 'Transferencia', mode: 'insensitive' },
      },
      select: { id: true },
    });
    const excludedCategoryIds = transferCategories.map((c) => c.id);
    // -----------------------------------------------------

    // 👇 2. Construimos un filtro base reutilizable
    const commonWhere: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(accountId && { accountId }), // Si existe accountId, filtra por él
    };

    const totals = await this.prisma.transaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: {
        ...commonWhere, // Usamos el filtro base

        // Filtros de exclusión existentes
        type: { not: TransactionType.TRANSFER },
        categoryId: {
          notIn:
            excludedCategoryIds.length > 0 ? excludedCategoryIds : undefined,
        },
      },
    });

    const income = Number(
      totals.find((t) => t.type === TransactionType.INCOME)?._sum.amount || 0,
    );
    const expense = Number(
      totals.find((t) => t.type === TransactionType.EXPENSE)?._sum.amount || 0,
    );

    // 👇 3. Lógica Diferenciada para Patrimonio (Total Available)
    let totalAvailable = 0;

    if (accountId) {
      // Caso A: Saldo de UNA cuenta específica
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        select: { balance: true },
      });
      totalAvailable = Number(account?.balance || 0);
    } else {
      // Caso B: Suma de TODAS las cuentas (Comportamiento original)
      const totalWealth = await this.prisma.account.aggregate({
        _sum: { balance: true },
        where: { userId },
      });
      totalAvailable = Number(totalWealth._sum.balance || 0);
    }

    // 4. Análisis de Gastos
    const expensesByCategory = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        ...commonWhere, // Usamos el filtro base (incluye accountId)
        type: TransactionType.EXPENSE,

        // Filtros de exclusión existentes
        categoryId: {
          notIn:
            excludedCategoryIds.length > 0 ? excludedCategoryIds : undefined,
        },
      },
    });

    // ... (El resto del código de categorías y map se mantiene IDÉNTICO) ...
    const categoryIds = expensesByCategory
      .map((e) => e.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    let fixedExpenses = 0;
    let variableExpenses = 0;

    const chartData = expensesByCategory.map((item) => {
      const amount = Number(item._sum.amount);
      const category = categories.find((c) => c.id === item.categoryId);

      if (category?.isFixed) {
        fixedExpenses += amount;
      } else {
        variableExpenses += amount;
      }

      return {
        categoryName: category?.name || 'Otros',
        total: amount,
        color: category?.color || '#94a3b8',
      };
    });

    return {
      summary: {
        income,
        expense,
        cashFlow: income - expense,
        totalAvailable, // Ya calculado arriba según el caso
      },
      chartData: chartData.sort((a, b) => b.total - a.total),
      expensesAnalysis: {
        fixed: fixedExpenses,
        variable: variableExpenses,
      },
    };
  }
}
