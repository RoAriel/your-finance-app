import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../common/utils/logger.util';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import PDFDocument from 'pdfkit-table';

// Interfaz local para tipado seguro dentro del PDF
interface TableRow {
  date: string;
  type: string;
  category: string;
  account: string;
  description: string;
  amount: string;
  currency: string;
}

@Injectable()
export class ExportsService {
  private readonly logger = new AppLogger(ExportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. Helper Centralizado de Datos
  private async getTransactionsData(userId: string, accountId?: string) {
    const start = Date.now();
    const data = await this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(accountId && { accountId }),
      },
      select: {
        date: true,
        type: true,
        description: true,
        amount: true,
        currency: true,
        category: { select: { name: true } },
        account: { select: { name: true, currency: true } },
      },
      orderBy: { date: 'desc' },
      take: 2000,
    });
    this.logger.log(`DB Fetch took: ${Date.now() - start}ms`);
    return data;
  }

  // 2. Exportar a Excel
  async exportTransactionsToExcel(
    userId: string,
    res: Response,
    accountId?: string,
  ) {
    this.logger.logOperation('Export Transactions to Excel', {
      userId,
      accountId,
    });
    const transactions = await this.getTransactionsData(userId, accountId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

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
      fgColor: { argb: 'FF1E293B' },
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
    res.end();
  }

  // 3. Exportar a CSV
  async exportTransactionsToCsv(
    userId: string,
    res: Response,
    accountId?: string,
  ) {
    this.logger.logOperation('Export Transactions to CSV', {
      userId,
      accountId,
    });
    const transactions = await this.getTransactionsData(userId, accountId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    worksheet.columns = [
      { header: 'Fecha', key: 'date' },
      { header: 'Tipo', key: 'type' },
      { header: 'Categoría', key: 'category' },
      { header: 'Cuenta', key: 'account' },
      { header: 'Descripción', key: 'description' },
      { header: 'Monto', key: 'amount' },
      { header: 'Moneda', key: 'currency' },
    ];

    transactions.forEach((t) => {
      worksheet.addRow({
        date: t.date.toISOString().split('T')[0],
        type: t.type,
        category: t.category?.name || '-',
        account: t.account?.name || '-',
        description: t.description,
        amount: Number(t.amount),
        currency: t.currency,
      });
    });

    await workbook.csv.write(res);
    res.end();
  }

  // 4. Exportar a PDF (Optimizado con PDFKit-Table) 🚀
  async exportTransactionsToPdf(
    userId: string,
    res: Response,
    accountId?: string,
  ) {
    this.logger.logOperation('Export Transactions to PDF', {
      userId,
      accountId,
    });
    const start = Date.now();

    const transactions = await this.getTransactionsData(userId, accountId);

    // Documento A4 con márgenes
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Conectar stream a la respuesta HTTP
    doc.pipe(res);

    // Encabezado
    doc.fontSize(18).text('Reporte de Movimientos', { align: 'center' });
    doc.fontSize(10).text(`Generado el: ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });
    doc.moveDown();

    // Configuración de la Tabla
    const table = {
      title: `Registros encontrados: ${transactions.length}`,
      subtitle: accountId
        ? 'Filtrado por cuenta específica'
        : 'Todas las cuentas',
      headers: [
        { label: 'Fecha', property: 'date', width: 60 },
        { label: 'Tipo', property: 'type', width: 50 },
        { label: 'Categoría', property: 'category', width: 80 },
        { label: 'Cuenta', property: 'account', width: 80 },
        { label: 'Descripción', property: 'description', width: 140 },
        { label: 'Monto', property: 'amount', width: 70, align: 'right' },
        { label: 'Mon', property: 'currency', width: 30 },
      ],
      datas: transactions.map((t) => ({
        date: t.date.toISOString().split('T')[0],
        type: t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
        category: t.category?.name || '-',
        account: t.account?.name || '-',
        description: t.description || '',
        amount: Number(t.amount).toFixed(2),
        currency: t.currency || t.account?.currency || '',
      })),
    };

    // Generar Tabla
    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
      prepareRow: (row, indexColumn) => {
        doc.font('Helvetica').fontSize(8);

        // Cast seguro a nuestra interfaz
        const rowData = row as TableRow;

        // Columna 5 es Monto: Rojo para Gastos, Verde para Ingresos
        if (indexColumn === 5) {
          doc.fillColor(rowData.type === 'Gasto' ? 'red' : 'green');
        } else {
          doc.fillColor('black');
        }
        return doc;
      },
    });

    doc.end();

    this.logger.logSuccess('PDF generated', {
      rows: transactions.length,
      time: `${Date.now() - start}ms`,
    });
  }
}
