import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.util';
import * as ExcelJS from 'exceljs';
import { Response } from 'express'; // Necesario para manejar el stream
import { TransactionType } from '../transactions/dto/create-transaction.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new AppLogger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTransactionsReport(userId: string, res: Response) {
    const operation = 'Exportar Reporte Excel';
    this.logger.logOperation(operation, { userId });

    try {
      // 1. Crear el Libro y la Hoja
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Mis Transacciones');

      // 2. Definir Columnas
      worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Tipo', key: 'type', width: 15 },
        { header: 'Categoría', key: 'category', width: 20 },
        { header: 'Descripción', key: 'description', width: 30 },
        { header: 'Monto', key: 'amount', width: 15 },
        { header: 'Moneda', key: 'currency', width: 10 },
      ];

      // 3. Estilo del Encabezado (Negrita)
      worksheet.getRow(1).font = { bold: true };

      // 4. Buscar Datos (Aquí en el futuro usaremos streaming de DB si son muchos datos)
      // Por ahora traemos todo, pero solo lo necesario
      const transactions = await this.prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: 'desc' },
      });

      // 5. Agregar filas
      transactions.forEach((t) => {
        worksheet.addRow({
          date: t.date,
          type: t.type,
          category: t.category?.name || 'Sin Categoría',
          description: t.description,
          amount: Number(t.amount), // Convertir Decimal a Number para Excel
          currency: t.currency,
        });
      });

      // 6. Escribir directamente en la respuesta (Stream)
      // Esto envía el archivo al navegador sin guardarlo en el disco del servidor
      await workbook.xlsx.write(res);

      this.logger.logSuccess(operation, { count: transactions.length });

      // Importante: No hacemos 'return' porque ya escribimos en 'res'
      res.end();
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }
  async getDashboardStats(userId: string) {
    const operation = 'Obtener Estadísticas Dashboard';

    try {
      this.logger.logOperation(operation, { userId });

      // 1. Agrupar Gastos por Categoría
      const expensesByCategory = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: {
          amount: true,
        },
        where: {
          userId,
          type: TransactionType.EXPENSE,
        },
      });

      // CORRECCIÓN 1: Filtramos los nulos usando un "Type Guard" (: id is string)
      // Esto le asegura a TypeScript que el array final es puramente string[]
      const categoryIds = expensesByCategory
        .map((e) => e.categoryId)
        .filter((id): id is string => id !== null);

      const categories = await this.prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const chartData = expensesByCategory.map((item) => {
        const category = categories.find((c) => c.id === item.categoryId);
        return {
          categoryName: category?.name || 'Desconocida',
          total: Number(item._sum.amount),
          color: category?.color || '#cccccc',
        };
      });

      // 4. Totales Generales
      const totals = await this.prisma.transaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: { userId },
      });

      // CORRECCIÓN 2: Usamos 'as string' para calmar a ESLint
      // Comparamos string con string explícitamente
      const summary = {
        income: Number(
          totals.find((t) => t.type === (TransactionType.INCOME as string))
            ?._sum.amount || 0,
        ),
        expense: Number(
          totals.find((t) => t.type === (TransactionType.EXPENSE as string))
            ?._sum.amount || 0,
        ),
        balance: 0,
      };
      summary.balance = summary.income - summary.expense;

      this.logger.logSuccess(operation, { categoriesCount: chartData.length });

      return {
        summary,
        chartData,
      };
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }
}
