import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { AppLogger } from '../common/utils/logger.util';
import { TransactionType } from '../transactions/dto/create-transaction.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Prisma } from '@prisma/client';

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
    } catch (error) {
      this.logger.logFailure(operation, error as Error);

      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
        throw new ConflictException(
          'Ya existe un presupuesto para esta categoría en ese mes y año.',
        );
      }

      throw error;
    }
  }

  async findAll(userId: string, month?: number, year?: number) {
    const operation = 'Obtener Reporte de Presupuestos';

    try {
      this.logger.logOperation(operation, { userId, month, year });

      // 1. Filtro dinámico limpio (usando tipos de Prisma)
      const whereInput: Prisma.BudgetWhereInput = {
        userId,
        ...(month && { month }),
        ...(year && { year }),
      };

      // A. Traemos los presupuestos
      const budgets = await this.prisma.budget.findMany({
        where: whereInput,
        include: { category: true },
        orderBy: { year: 'desc' },
      });

      // B. Calculamos el "Gastado Real" cruzando con Transacciones
      const report = await Promise.all(
        budgets.map(async (budget) => {
          // --- CORRECCIÓN DE FECHAS (Cobertura total del mes) ---
          // Desde: Día 1 del mes a las 00:00:00
          const startDate = new Date(budget.year, budget.month - 1, 1);

          // Hasta: Día 1 del MES SIGUIENTE a las 00:00:00
          // Usaremos "menor estricto" (<) para incluir hasta el último milisegundo del mes actual
          const nextMonthDate = new Date(budget.year, budget.month, 1);

          // C. Consulta de Agregación (SUM)
          const aggregate = await this.prisma.transaction.aggregate({
            _sum: {
              amount: true,
            },
            where: {
              userId,
              categoryId: budget.categoryId,
              type: TransactionType.EXPENSE,
              date: {
                gte: startDate, // Mayor o igual al inicio
                lt: nextMonthDate, // Menor estricto al inicio del siguiente mes
              },
            },
          });

          // D. Matemáticas Simples
          const spent = Number(aggregate._sum.amount || 0);
          const limit = Number(budget.amount); // Tu DB usa 'amount'
          const remaining = limit - spent;
          const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

          let status = 'OK';
          if (percentage >= 100) {
            status = 'EXCEEDED';
          } else if (percentage >= 80) {
            status = 'WARNING';
          }

          // E. Retorno con nombres que espera el Frontend
          return {
            id: budget.id,
            categoryId: budget.categoryId,
            categoryName: budget.category.name,
            categoryIcon: budget.category.icon,
            categoryColor: budget.category.color,
            month: budget.month,
            year: budget.year,
            amount: limit, // Frontend espera 'amount' (o 'limit', según tu interfaz, ajústalo si es necesario)
            spent: spent,
            remaining,
            percentage,
            status,
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

  private async findOneAndValidateOwner(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });

    if (!budget) throw new NotFoundException('Budget not found');
    if (budget.userId !== userId)
      throw new ForbiddenException('You do not own this budget');

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
    const operation = 'Actualizar Presupuesto';

    try {
      this.logger.logOperation(operation, { id, ...updateBudgetDto });

      // Validamos que sea suyo antes de tocar nada
      await this.findOneAndValidateOwner(id, userId);

      const updatedBudget = await this.prisma.budget.update({
        where: { id },
        data: updateBudgetDto,
      });

      this.logger.logSuccess(operation, { id: updatedBudget.id });
      return updatedBudget;
    } catch (error) {
      this.logger.logFailure(operation, error as Error); // 👈 Fix del log

      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
        // 👈 Fix del .code
        throw new ConflictException(
          'Ya existe otro presupuesto con esa configuración.',
        );
      }
      throw error;
    }
  }

  // 3. Eliminar Presupuesto
  async remove(id: string, userId: string) {
    const operation = 'Eliminar Presupuesto';

    try {
      this.logger.logOperation(operation, { id, userId });

      // Validamos propiedad
      await this.findOneAndValidateOwner(id, userId);

      await this.prisma.budget.delete({
        where: { id },
      });

      this.logger.logSuccess(operation, { id });
      return { message: 'Budget deleted successfully' };
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }
}
