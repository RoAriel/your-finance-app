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

    // 1. Obtener Totales Globales (Ingresos vs Gastos)
    // Usamos una sola query para agrupar por tipo
    const totals = await this.prisma.transaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: { userId, deletedAt: null },
    });

    const income = Number(
      totals.find((t) => t.type === TransactionType.INCOME)?._sum.amount || 0,
    );
    const expense = Number(
      totals.find((t) => t.type === TransactionType.EXPENSE)?._sum.amount || 0,
    );

    // 2. Obtener Patrimonio Total (Suma de saldos de cuentas)
    const totalWealth = await this.prisma.account.aggregate({
      _sum: { balance: true },
      where: { userId },
    });

    // 3. Análisis de Gastos (Optimizado: 1 sola query de agrupación)
    const expensesByCategory = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        userId,
        type: TransactionType.EXPENSE,
        deletedAt: null,
      },
    });

    // Obtener detalles de las categorías involucradas (Nombres, Colores, isFixed)
    const categoryIds = expensesByCategory
      .map((e) => e.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    // 4. Procesamiento en Memoria (Chart Data + Fixed/Variable Split)
    // Evitamos llamar a la DB 2 veces más para fixed/variable
    let fixedExpenses = 0;
    let variableExpenses = 0;

    const chartData = expensesByCategory.map((item) => {
      const amount = Number(item._sum.amount);
      const category = categories.find((c) => c.id === item.categoryId);

      // Sumamos al acumulador correspondiente según la categoría
      if (category?.isFixed) {
        fixedExpenses += amount;
      } else {
        variableExpenses += amount;
      }

      return {
        categoryName: category?.name || 'Otros',
        total: amount,
        color: category?.color || '#94a3b8', // Gris default
      };
    });

    return {
      summary: {
        income,
        expense,
        cashFlow: income - expense,
        totalAvailable: Number(totalWealth._sum.balance || 0),
      },
      chartData: chartData.sort((a, b) => b.total - a.total), // Ordenamos por mayor gasto
      expensesAnalysis: {
        fixed: fixedExpenses,
        variable: variableExpenses,
      },
    };
  }
}
