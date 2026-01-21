import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { AppLogger } from '../common/utils/logger.util';
import { TransactionType } from '../transactions/dto/create-transaction.dto';

@Injectable()
export class BudgetsService {
  private readonly logger = new AppLogger(BudgetsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    const operation = 'Crear Presupuesto';
    const { categoryId, month, year, amount } = createBudgetDto;

    try {
      this.logger.logOperation(operation, { userId, month, year, categoryId });

      const budget = await this.prisma.budget.create({
        data: {
          amount,
          month,
          year,
          categoryId,
          userId,
        },
      });

      this.logger.logSuccess(operation, { id: budget.id });
      return budget;
    } catch (error: any) {
      this.logger.logFailure(operation, error);

      if (error.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un presupuesto para esta categoría en ese mes y año.',
        );
      }

      throw error;
    }
  }

  async findAll(userId: string) {
    const operation = 'Obtener Reporte de Presupuestos';

    try {
      this.logger.logOperation(operation, { userId });

      // A. Traemos todos los presupuestos definidos
      const budgets = await this.prisma.budget.findMany({
        where: { userId },
        include: { category: true }, // Traemos el nombre de la categoría (ej: "Comida")
        orderBy: { year: 'desc' }, // Ordenamos por fecha
      });

      // B. Calculamos el "Gastado Real" para cada presupuesto
      // Usamos Promise.all para hacer los cálculos en paralelo (rápido)
      const report = await Promise.all(
        budgets.map(async (budget) => {
          // Definir el rango de fechas del mes del presupuesto
          // Nota: en JS los meses son base 0 (Enero = 0), pero en tu DB guardamos 1
          const startDate = new Date(budget.year, budget.month - 1, 1);
          const endDate = new Date(budget.year, budget.month, 0); // Día 0 del siguiente mes = Último día de este mes

          // C. Consulta de Agregación (SUM)
          const aggregate = await this.prisma.transaction.aggregate({
            _sum: {
              amount: true,
            },
            where: {
              userId,
              categoryId: budget.categoryId,
              type: TransactionType.EXPENSE, // Solo sumamos GASTOS (ignoramos ingresos o transferencias)
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          });

          // D. Matemáticas Simples
          const spent = Number(aggregate._sum.amount || 0);
          const limit = Number(budget.amount);
          const remaining = limit - spent;
          const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

          // E. Devolvemos el objeto enriquecido
          return {
            id: budget.id,
            category: budget.category.name, // Nombre amigable
            month: budget.month,
            year: budget.year,
            limit: limit, // Lo que planeaste
            spent: spent, // Lo que gastaste realidad
            remaining, // Lo que te queda
            percentage, // % de barra de progreso (ej: 80%)
            status: percentage > 100 ? 'EXCEEDED' : 'OK',
          };
        }),
      );

      this.logger.logSuccess(operation, { count: report.length });
      return report;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }
}
