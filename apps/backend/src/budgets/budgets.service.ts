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
import { fromZonedTime } from 'date-fns-tz';
import { addMonths } from 'date-fns';

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

      // 👇 2. Obtenemos la preferencia de zona horaria del usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      });
      // Fallback seguro si no tiene timezone definida
      const timeZone = user?.timezone || 'America/Argentina/Buenos_Aires';

      const whereInput: Prisma.BudgetWhereInput = {
        userId,
        ...(month && { month }),
        ...(year && { year }),
      };

      const budgets = await this.prisma.budget.findMany({
        where: whereInput,
        include: { category: true },
        orderBy: { year: 'desc' },
      });

      const report = await Promise.all(
        budgets.map(async (budget) => {
          // 👇 3. CÁLCULO DE FECHAS "TIMEZONE AWARE"

          // Construimos una fecha "local" para el día 1 de ese mes/año
          // Nota: El string debe ser ISO compatible para que date-fns lo entienda base
          // Formato: YYYY-MM-DD (Mes con 0 a la izquierda)
          const monthStr = budget.month.toString().padStart(2, '0');
          const dateString = `${budget.year}-${monthStr}-01T00:00:00`;

          // A. Inicio del mes en la zona horaria del usuario convertido a UTC (para la DB)
          const startDate = fromZonedTime(dateString, timeZone);

          // B. Inicio del MES SIGUIENTE (Límite superior estricto)
          // Sumamos 1 mes a la fecha base y convertimos
          const nextMonthDateLocal = addMonths(new Date(dateString), 1);
          // Reconstruimos el string para asegurar la hora 00:00:00 en la zona correcta
          const nextMonthStr = nextMonthDateLocal.toISOString().slice(0, 7); // YYYY-MM
          const nextMonthDate = fromZonedTime(
            `${nextMonthStr}-01T00:00:00`,
            timeZone,
          );

          // C. Consulta de Agregación (Ahora usa rangos UTC exactos)
          const aggregate = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
              userId,
              categoryId: budget.categoryId,
              type: TransactionType.EXPENSE,
              date: {
                gte: startDate, // >= 1ro Feb 00:00 ART (en UTC)
                lt: nextMonthDate, // < 1ro Mar 00:00 ART (en UTC)
              },
            },
          });

          const spent = Number(aggregate._sum.amount || 0);
          const limit = Number(budget.amount);
          const remaining = limit - spent;
          const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

          let status = 'OK';
          if (percentage >= 100) status = 'EXCEEDED';
          else if (percentage >= 80) status = 'WARNING';

          return {
            id: budget.id,
            categoryId: budget.categoryId,
            categoryName: budget.category.name,
            categoryIcon: budget.category.icon,
            categoryColor: budget.category.color,
            month: budget.month,
            year: budget.year,
            amount: limit,
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
