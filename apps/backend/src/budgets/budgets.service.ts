import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { AppLogger } from '../common/utils/logger.util';
import { TransactionType } from '../transactions/dto/create-transaction.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Prisma } from '@prisma/client';
import { fromZonedTime } from 'date-fns-tz';
import { addMonths } from 'date-fns';

export interface BudgetResponse {
  id?: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  spent: number;
  directSpent: number;
  remaining: number;
  percentage: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED' | 'UNBUDGETED';
  children: BudgetResponse[];
}

interface BudgetTreeNode {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  parentId: string | null;
  budgetId?: string;
  limit: number;
  spentDirect: number;
  spentRecursive: number;
  percentage: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED' | 'UNBUDGETED';
  children: BudgetTreeNode[];
}

@Injectable()
export class BudgetsService {
  private readonly logger = new AppLogger(BudgetsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // 1. CREAR PRESUPUESTO
  // ===========================================================================
  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    const operation = 'Crear Presupuesto';
    const { categoryId, month, year, amount } = createBudgetDto;

    try {
      this.logger.logOperation(operation, { userId, categoryId, amount });

      // 🛡️ VALIDACIÓN 1: ¿Rompo el techo de mi padre?
      await this.validateChildCap(userId, categoryId, amount, month, year);

      // 🛡️ VALIDACIÓN 2: ¿Rompo el piso de mis hijos?
      // (Raro en Create porque usualmente creas padres antes que hijos, pero posible si el orden es inverso)
      await this.validateParentFloor(userId, categoryId, amount, month, year);

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
      this.handleError(operation, error);
    }
  }

  // ===========================================================================
  // 2. ACTUALIZAR PRESUPUESTO
  // ===========================================================================
  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
    const operation = 'Actualizar Presupuesto';
    try {
      this.logger.logOperation(operation, { id, ...updateBudgetDto });

      const currentBudget = await this.findOneAndValidateOwner(id, userId);

      if (updateBudgetDto.amount !== undefined) {
        const month = updateBudgetDto.month ?? currentBudget.month;
        const year = updateBudgetDto.year ?? currentBudget.year;
        const categoryId =
          updateBudgetDto.categoryId ?? currentBudget.categoryId;
        const newAmount = Number(updateBudgetDto.amount);

        // 🛡️ VALIDACIÓN 1: Hacia Arriba (Padre)
        await this.validateChildCap(
          userId,
          categoryId,
          newAmount,
          month,
          year,
          id, // Excluir self
        );

        // 🛡️ VALIDACIÓN 2: Hacia Abajo (Hijos)
        // ESTO ES LO NUEVO IMPORTANTE: Si bajo mi presupuesto, debo cubrir a mis hijos.
        await this.validateParentFloor(
          userId,
          categoryId,
          newAmount,
          month,
          year,
        );
      }

      const updatedBudget = await this.prisma.budget.update({
        where: { id },
        data: updateBudgetDto,
      });
      this.logger.logSuccess(operation, { id: updatedBudget.id });
      return updatedBudget;
    } catch (error) {
      this.handleError(operation, error);
    }
  }

  // ===========================================================================
  // 3. FIND ALL (Tu implementación es perfecta, la mantengo igual) ✅
  // ===========================================================================
  async findAll(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<BudgetResponse[]> {
    //const operation = 'Reporte Presupuestos Recursivo';
    // ... (Mantén tu lógica de Fechas y Timezone aquí) ...
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timeZone = user?.timezone || 'America/Argentina/Buenos_Aires';

    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const monthStr = targetMonth.toString().padStart(2, '0');
    const dateString = `${targetYear}-${monthStr}-01T00:00:00`;
    const startDate = fromZonedTime(dateString, timeZone);
    const nextMonthDateLocal = addMonths(new Date(dateString), 1);
    const nextMonthStr = nextMonthDateLocal.toISOString().slice(0, 7);
    const nextMonthDate = fromZonedTime(
      `${nextMonthStr}-01T00:00:00`,
      timeZone,
    );

    const [allCategories, allBudgets, expensesAgg] = await Promise.all([
      this.prisma.category.findMany({
        where: { userId, deletedAt: null },
        select: {
          id: true,
          name: true,
          parentId: true,
          color: true,
          icon: true,
        },
      }),
      this.prisma.budget.findMany({
        where: { userId, month: targetMonth, year: targetYear },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: startDate, lt: nextMonthDate },
          deletedAt: null,
          categoryId: { not: null },
        },
      }),
    ]);

    // ... (Mantén tu lógica de construcción de árbol y recursividad) ...
    // Solo resumo para no ocupar espacio, pero tu lógica C1, C2, C3 es correcta.

    const nodesMap = new Map<string, BudgetTreeNode>();

    allCategories.forEach((cat) => {
      const budget = allBudgets.find((b) => b.categoryId === cat.id);
      const expense = expensesAgg.find((e) => e.categoryId === cat.id);
      const spentDirect = expense?._sum.amount
        ? Number(expense._sum.amount)
        : 0;

      nodesMap.set(cat.id, {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color || '#ccc',
        icon: cat.icon || 'Wallet', // Fallback a un string válido de tu IconMap
        parentId: cat.parentId,
        budgetId: budget?.id,
        limit: budget ? Number(budget.amount) : 0,
        spentDirect: spentDirect,
        spentRecursive: spentDirect,
        percentage: 0,
        status: 'OK',
        children: [],
      });
    });

    const rootNodes: BudgetTreeNode[] = [];
    nodesMap.forEach((node) => {
      if (node.parentId && nodesMap.has(node.parentId)) {
        nodesMap.get(node.parentId)?.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    const calculateRecursiveStats = (node: BudgetTreeNode): number => {
      let childrenSpent = 0;
      for (const child of node.children) {
        childrenSpent += calculateRecursiveStats(child);
      }
      node.spentRecursive = node.spentDirect + childrenSpent;
      if (node.limit > 0) {
        node.percentage = Math.round((node.spentRecursive / node.limit) * 100);
        if (node.percentage >= 100) node.status = 'EXCEEDED';
        else if (node.percentage >= 80) node.status = 'WARNING';
        else node.status = 'OK';
      } else {
        node.percentage = 0;
        node.status = 'UNBUDGETED';
      }
      return node.spentRecursive;
    };

    rootNodes.forEach((root) => calculateRecursiveStats(root));

    const mapResponse = (nodes: BudgetTreeNode[]): BudgetResponse[] => {
      return nodes.map((node) => ({
        id: node.budgetId,
        categoryId: node.categoryId,
        categoryName: node.categoryName,
        categoryColor: node.color,
        categoryIcon: node.icon, // Usar el campo mapeado arriba
        amount: node.limit,
        spent: node.spentRecursive,
        directSpent: node.spentDirect,
        remaining: Math.max(0, node.limit - node.spentRecursive),
        percentage: node.percentage,
        status: node.status,
        children: mapResponse(node.children),
      }));
    };

    return mapResponse(rootNodes);
  }

  // ===========================================================================
  // 4. HELPERS DE VALIDACIÓN 🛡️
  // ===========================================================================

  /**
   * VALIDACIÓN "HACIA ARRIBA" (Child Cap)
   * Verifica que la suma de (Mis Hermanos + Yo) <= Presupuesto de mi Padre
   */
  private async validateChildCap(
    userId: string,
    categoryId: string,
    newAmount: number,
    month: number,
    year: number,
    excludeBudgetId?: string,
  ) {
    // 1. Buscamos quién es mi padre
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { parentId: true, name: true },
    });

    if (!category || !category.parentId) return; // Si soy raíz, no tengo techo.

    // 2. Buscamos el presupuesto del Padre
    const parentBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        categoryId: category.parentId,
        month,
        year,
      },
    });

    if (!parentBudget) return; // Si el padre no tiene presupuesto, "chipe libre" (o error según negocio)

    // 3. Sumamos a mis hermanos (incluyéndome si es create, excluyéndome si es update)
    const siblings = await this.prisma.category.findMany({
      where: { parentId: category.parentId, userId },
      select: { id: true },
    });
    const siblingIds = siblings.map((s) => s.id);

    const siblingsBudgets = await this.prisma.budget.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        month,
        year,
        categoryId: { in: siblingIds },
        id: excludeBudgetId ? { not: excludeBudgetId } : undefined,
      },
    });

    const currentUsed = Number(siblingsBudgets._sum.amount || 0);
    const parentLimit = Number(parentBudget.amount);

    if (currentUsed + newAmount > parentLimit) {
      const remaining = parentLimit - currentUsed;
      throw new BadRequestException(
        `El presupuesto supera el límite de la categoría padre. Disponible: $${remaining}.`,
      );
    }
  }

  /**
   * VALIDACIÓN "HACIA ABAJO" (Parent Floor)
   * Verifica que (Mis Hijos sumados) <= Mi Nuevo Presupuesto
   */
  private async validateParentFloor(
    userId: string,
    categoryId: string,
    newParentAmount: number,
    month: number,
    year: number,
  ) {
    // 1. Buscamos mis hijos
    const childrenCategories = await this.prisma.category.findMany({
      where: { parentId: categoryId, userId },
      select: { id: true },
    });

    if (childrenCategories.length === 0) return; // Si no tengo hijos, no hay piso.

    const childrenIds = childrenCategories.map((c) => c.id);

    // 2. Sumamos los presupuestos de mis hijos
    const childrenBudgets = await this.prisma.budget.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        month,
        year,
        categoryId: { in: childrenIds },
      },
    });

    const totalChildrenAmount = Number(childrenBudgets._sum.amount || 0);

    // 3. Check: ¿Mi nuevo monto cubre a mis hijos?
    if (newParentAmount < totalChildrenAmount) {
      throw new BadRequestException(
        `El monto es menor a la suma de las subcategorías ($${totalChildrenAmount}). Ajusta las subcategorías primero.`,
      );
    }
  }

  // --- Helpers Genéricos ---

  async findOneAndValidateOwner(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    if (budget.userId !== userId)
      throw new ForbiddenException('No tienes permiso');
    return budget;
  }

  async remove(id: string, userId: string) {
    // ... tu lógica de remove ...
    // NOTA: Al borrar un presupuesto padre, no necesariamente rompes reglas matemáticas,
    // pero dejas a los hijos "huérfanos de límite". Eso suele ser aceptable.
    return this.prisma.budget.delete({ where: { id } });
  }

  private handleError(operation: string, error: any) {
    this.logger.logFailure(operation, error as Error);
    if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
      throw new ConflictException(
        'Ya existe un presupuesto para esta categoría este mes.',
      );
    }
    throw error;
  }
}
