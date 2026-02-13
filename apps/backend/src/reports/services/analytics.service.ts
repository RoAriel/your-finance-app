import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../common/utils/logger.util';
import { TransactionType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new AppLogger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    this.logger.logOperation('Get Dashboard Analytics', { userId });

    // 1. Identificar categorías a excluir (Transferencias)
    const transferCategories = await this.prisma.category.findMany({
      where: {
        userId,
        name: { contains: 'Transferencia', mode: 'insensitive' },
      },
      select: { id: true },
    });

    const excludedCategoryIds = transferCategories.map((c) => c.id);

    const totals = await this.prisma.transaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: {
        userId,
        deletedAt: null,

        // 👇 FILTRO MEJORADO:
        // 1. Excluimos explícitamente el tipo TRANSFER
        type: { not: TransactionType.TRANSFER },

        // 2. Excluimos las transacciones (incluidos INCOMES) que pertenezcan
        // a la categoría "Transferencia". Como AccountsService ahora asigna
        // esta categoría siempre, las transferencias de entrada serán ignoradas aquí.
        categoryId: {
          notIn:
            excludedCategoryIds.length > 0 ? excludedCategoryIds : undefined,
        },
      },
    });

    // 1. Obtener Totales Globales
    const income = Number(
      totals.find((t) => t.type === TransactionType.INCOME)?._sum.amount || 0,
    );
    const expense = Number(
      totals.find((t) => t.type === TransactionType.EXPENSE)?._sum.amount || 0,
    );

    // 2. Obtener Patrimonio Total
    const totalWealth = await this.prisma.account.aggregate({
      _sum: { balance: true },
      where: { userId },
    });

    // 3. Análisis de Gastos
    const expensesByCategory = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        userId,
        type: TransactionType.EXPENSE,
        deletedAt: null,
        // Opcional: Aseguramos que las transferencias no salgan en gráficos de gastos
        categoryId: {
          notIn:
            excludedCategoryIds.length > 0 ? excludedCategoryIds : undefined,
        },
      },
    });

    // Obtener detalles de las categorías
    const categoryIds = expensesByCategory
      .map((e) => e.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    // 4. Procesamiento en Memoria
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
        totalAvailable: Number(totalWealth._sum.balance || 0),
      },
      chartData: chartData.sort((a, b) => b.total - a.total),
      expensesAnalysis: {
        fixed: fixedExpenses,
        variable: variableExpenses,
      },
    };
  }
}
