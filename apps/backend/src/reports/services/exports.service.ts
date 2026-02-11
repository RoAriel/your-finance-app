import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../common/utils/logger.util';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExportsService {
  private readonly logger = new AppLogger(ExportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exportTransactionsToExcel(userId: string, res: Response) {
    this.logger.logOperation('Export Transactions to Excel', { userId });

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
      take: 2000, // Limite de seguridad para no explotar memoria
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

    // Estilos
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Tipo', key: 'type', width: 12 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Cuenta', key: 'account', width: 20 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Monto', key: 'amount', width: 15 },
      { header: 'Moneda', key: 'currency', width: 10 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate-800
    };

    transactions.forEach((t) => {
      worksheet.addRow({
        date: t.date,
        type: t.type,
        category: t.category?.name || '-',
        account: t.account?.name || '-',
        description: t.description,
        amount: Number(t.amount),
        currency: t.currency,
      });
    });

    await workbook.xlsx.write(res);
    this.logger.logSuccess('Excel generated', { rows: transactions.length });
    res.end();
  }
}
