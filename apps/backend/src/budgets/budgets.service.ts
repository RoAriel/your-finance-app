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
  children: BudgetResponse[]; // Recursividad tipada
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
  // 1. CREAR PRESUPUESTO (Con Validación de Topes)
  // ===========================================================================
  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    const operation = 'Crear Presupuesto';
    const { categoryId, month, year, amount } = createBudgetDto;

    try {
      this.logger.logOperation(operation, { userId, categoryId, amount });

      // 🔍 VALIDACIÓN DE INTEGRIDAD (TOPES)
      await this.validateBudgetCap(userId, categoryId, amount, month, year);

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
          'Ya existe un presupuesto para esta categoría este mes.',
        );
      }
      throw error;
    }
  }

  // ===========================================================================
  // 2. ACTUALIZAR PRESUPUESTO (Con Validación de Topes)
  // ===========================================================================
  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
    const operation = 'Actualizar Presupuesto';
    try {
      this.logger.logOperation(operation, { id, ...updateBudgetDto });

      // 1. Obtener presupuesto actual para saber su categoryId, month y year
      const currentBudget = await this.findOneAndValidateOwner(id, userId);

      // 2. Si se actualiza el monto, validamos topes
      if (updateBudgetDto.amount !== undefined) {
        // Usamos los datos nuevos o mantenemos los viejos
        const month = updateBudgetDto.month ?? currentBudget.month;
        const year = updateBudgetDto.year ?? currentBudget.year;
        const categoryId =
          updateBudgetDto.categoryId ?? currentBudget.categoryId;

        // Validamos excluyendo el presupuesto actual (para no duplicar suma)
        await this.validateBudgetCap(
          userId,
          categoryId,
          Number(updateBudgetDto.amount),
          month,
          year,
          id, // Pasamos el ID para excluirlo de la suma de "hermanos"
        );
      }

      const updatedBudget = await this.prisma.budget.update({
        where: { id },
        data: updateBudgetDto,
      });
      this.logger.logSuccess(operation, { id: updatedBudget.id });
      return updatedBudget;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  // ===========================================================================
  // 3. FIND ALL RECURSIVO (El Corazón de la Lógica) 🧠
  // ===========================================================================
  async findAll(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<BudgetResponse[]> {
    const operation = 'Reporte Presupuestos Recursivo';
    this.logger.logOperation(operation, { userId, month, year });

    // A. Resolver Rango de Fechas (Timezone Aware)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timeZone = user?.timezone || 'America/Argentina/Buenos_Aires';

    // Si no vienen mes/año, usamos los actuales (o manejas el error según prefieras)
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

    // B. FETCH MASIVO (Parallel) ⚡
    // Traemos TODO lo necesario en 3 consultas limpias
    const [allCategories, allBudgets, expensesAgg] = await Promise.all([
      // 1. Todas las categorías (para armar el esqueleto del árbol)
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
      // 2. Todos los presupuestos del mes
      this.prisma.budget.findMany({
        where: { userId, month: targetMonth, year: targetYear },
      }),
      // 3. Gastos agrupados por categoría
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: startDate, lt: nextMonthDate },
          deletedAt: null,
          categoryId: { not: null }, // Solo gastos con categoría
        },
      }),
    ]);

    // C. CONSTRUCCIÓN DEL ÁRBOL EN MEMORIA 🌳

    // Mapa auxiliar para acceso rápido por ID
    const nodesMap = new Map<string, BudgetTreeNode>();

    // C1. Inicializar Nodos (Flat)
    allCategories.forEach((cat) => {
      // Buscar si tiene presupuesto asignado
      const budget = allBudgets.find((b) => b.categoryId === cat.id);
      // Buscar gasto directo
      const expense = expensesAgg.find((e) => e.categoryId === cat.id);
      const spentDirect = expense?._sum.amount
        ? Number(expense._sum.amount)
        : 0;

      nodesMap.set(cat.id, {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color || '#ccc',
        icon: cat.icon || 'circle',
        parentId: cat.parentId,

        budgetId: budget?.id,
        limit: budget ? Number(budget.amount) : 0,

        spentDirect: spentDirect,
        spentRecursive: spentDirect, // Inicialmente es igual al directo

        percentage: 0, // Se calcula al final
        status: 'OK', // Se calcula al final
        children: [],
      });
    });

    // C2. Armar Jerarquía (Vincular Hijos a Padres)
    const rootNodes: BudgetTreeNode[] = [];

    nodesMap.forEach((node) => {
      if (node.parentId && nodesMap.has(node.parentId)) {
        const parent = nodesMap.get(node.parentId);
        parent?.children.push(node);
      } else {
        // Si no tiene padre (o el padre no existe/fue borrado), es raíz
        rootNodes.push(node);
      }
    });

    // C3. CÁLCULO RECURSIVO (Bottom-Up) 🧮
    // Necesitamos sumar los gastos de los hijos al padre.
    // Usamos una función helper recursiva.
    const calculateRecursiveStats = (node: BudgetTreeNode): number => {
      // 1. Sumar recursivamente los hijos
      let childrenSpent = 0;
      for (const child of node.children) {
        childrenSpent += calculateRecursiveStats(child);
      }

      // 2. Actualizar gasto recursivo del nodo actual
      node.spentRecursive = node.spentDirect + childrenSpent;

      // 3. Calcular Estado y Porcentaje del nodo actual
      if (node.limit > 0) {
        node.percentage = Math.round((node.spentRecursive / node.limit) * 100);
        if (node.percentage >= 100) node.status = 'EXCEEDED';
        else if (node.percentage >= 80) node.status = 'WARNING';
        else node.status = 'OK';
      } else {
        node.percentage = 0;
        node.status = 'UNBUDGETED'; // Info útil para el front
      }

      return node.spentRecursive;
    };

    // Ejecutamos el cálculo para cada nodo raíz
    rootNodes.forEach((root) => calculateRecursiveStats(root));

    // C4. LIMPIEZA FINAL (Opcional)
    // Podríamos filtrar nodos que no tienen presupuesto NI gastos,
    // pero generalmente en la pantalla de Presupuestos quieres ver todo el árbol
    // para saber dónde asignar dinero. Devolvemos todo el árbol.

    // Mapeamos a la respuesta final (calculando 'remaining')
    // Hacemos un mapping recursivo simple para formatear si fuera necesario,
    // pero BudgetTreeNode ya tiene casi todo.
    const mapResponse = (nodes: BudgetTreeNode[]): BudgetResponse[] => {
      return nodes.map((node) => ({
        id: node.budgetId,
        categoryId: node.categoryId,
        categoryName: node.categoryName,
        categoryColor: node.color,
        categoryIcon: node.icon,

        amount: node.limit,
        spent: node.spentRecursive,
        directSpent: node.spentDirect,
        remaining: Math.max(0, node.limit - node.spentRecursive),
        percentage: node.percentage,
        status: node.status,

        children: mapResponse(node.children), // Recursión tipada
      }));
    };

    const result = mapResponse(rootNodes);

    this.logger.logSuccess(operation, { roots: rootNodes.length });
    return result;
  }

  // ===========================================================================
  // 4. HELPERS DE VALIDACIÓN 🛡️
  // ===========================================================================

  /**
   * Valida que un hijo no rompa el límite del padre.
   * Regla: Suma(Presupuestos Hermanos) + Nuevo Presupuesto <= Presupuesto Padre
   */
  private async validateBudgetCap(
    userId: string,
    categoryId: string,
    newAmount: number,
    month: number,
    year: number,
    excludeBudgetId?: string, // Para updates (excluirse a sí mismo)
  ) {
    // 1. Obtener la categoría para ver quién es su padre
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { parentId: true, name: true },
    });

    if (!category) throw new NotFoundException('Categoría no encontrada');

    // Si no tiene padre, es raíz. Por ahora no validamos límites globales, solo jerárquicos.
    if (!category.parentId) return;

    // 2. Buscar si el Padre tiene presupuesto
    const parentBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        categoryId: category.parentId,
        month,
        year,
      },
    });

    // Si el padre NO tiene presupuesto definido, asumimos que no hay techo (o podrías prohibirlo).
    // Por flexibilidad, permitimos hijos con presupuesto aunque el padre no tenga.
    if (!parentBudget) return;

    // 3. Sumar presupuestos de los "Hermanos" (hijos del mismo padre)
    // Buscamos todas las categorías hermanas
    const siblings = await this.prisma.category.findMany({
      where: { parentId: category.parentId, userId },
      select: { id: true },
    });
    const siblingIds = siblings.map((s) => s.id);

    // Sumamos los budgets de esos IDs
    const siblingsBudgets = await this.prisma.budget.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        month,
        year,
        categoryId: { in: siblingIds },
        id: excludeBudgetId ? { not: excludeBudgetId } : undefined, // Excluir self en update
      },
    });

    const totalSiblingsAmount = Number(siblingsBudgets._sum.amount || 0);
    const parentLimit = Number(parentBudget.amount);

    // 4. Check Final
    if (totalSiblingsAmount + newAmount > parentLimit) {
      const remaining = parentLimit - totalSiblingsAmount;
      throw new BadRequestException(
        `El presupuesto excede el límite del Padre. El padre tiene ${parentLimit}, los hermanos usan ${totalSiblingsAmount}. Solo quedan ${remaining} disponibles para ${category.name}.`,
      );
    }
  }

  // Helper simple para update/delete
  async findOneAndValidateOwner(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    if (budget.userId !== userId)
      throw new ForbiddenException('No tienes permiso');
    return budget;
  }

  async remove(id: string, userId: string) {
    const operation = 'Eliminar Presupuesto'; // Log Context

    try {
      this.logger.logOperation(operation, { id, userId }); // 1. Log Entrada

      await this.findOneAndValidateOwner(id, userId);

      const deleted = await this.prisma.budget.delete({ where: { id } });

      this.logger.logSuccess(operation, { id }); // 2. Log Éxito
      return deleted;
    } catch (error) {
      this.logger.logFailure(operation, error as Error); // 3. Log Error
      throw error;
    }
  }
}
