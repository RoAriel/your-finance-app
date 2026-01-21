import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.util';
import * as ExcelJS from 'exceljs';
import { Response } from 'express'; // Necesario para manejar el stream

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
}
