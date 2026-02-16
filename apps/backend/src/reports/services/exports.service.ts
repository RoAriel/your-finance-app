import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../common/utils/logger.util';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
// PDFKit Table para el reporte rápido
import PDFDocument from 'pdfkit-table';
import puppeteer, { Browser } from 'puppeteer';
import Handlebars from 'handlebars';

import { visualReportTemplate } from '../services/templates/visual-report.template';
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

interface TransactionWithAccount {
  account: { name: string } | null;
}
@Injectable()
export class ExportsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger(ExportsService.name);
  private browser: Browser | null = null;

  constructor(private readonly prisma: PrismaService) {}

  // 1. INICIALIZACIÓN SEGURA
  async onModuleInit() {
    this.logger.log('Launching Shared Puppeteer Instance...');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      this.logger.log('Puppeteer Browser Ready 🚀');
    } catch (error) {
      // 🚨 CRÍTICO: Capturamos el error para que NO se caiga el servidor
      this.logger.error(
        '⚠️ Failed to launch Puppeteer. Visual PDFs will not work.',
        (error as Error).message,
      );
      // La app sigue cargando, pero this.browser quedará null
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.log('Puppeteer Browser Closed');
    }
  }

  // ===========================================================================
  // HELPER: Obtener Datos
  // ===========================================================================
  private async getTransactionsData(userId: string, accountId?: string) {
    const start = Date.now();

    const cleanAccountId =
      accountId && accountId !== 'null' && accountId.trim() !== ''
        ? accountId
        : undefined;

    this.logger.log(
      `[DataFetch] User: ${userId} | Account Filter: ${cleanAccountId || 'ALL (Todas)'}`,
    );

    const whereClause: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
    };

    if (cleanAccountId) {
      whereClause.accountId = cleanAccountId;
    }

    const data = await this.prisma.transaction.findMany({
      where: whereClause,
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

    this.logger.log(
      `[DataFetch] Found ${data.length} records. Time: ${Date.now() - start}ms`,
    );
    return data;
  }

  private async resolveAccountName(
    userId: string,
    accountId: string | undefined,
    transactions: TransactionWithAccount[],
  ): Promise<string | null> {
    // 1. Si no hay filtro, retornamos null (significa "Todas")
    if (!accountId) return null;

    // 2. Optimización: Si ya trajimos transacciones, el nombre está ahí (¡Gratis!)
    if (transactions.length > 0 && transactions[0].account) {
      return transactions[0].account.name;
    }

    // 3. Fallback: Si el filtro existe pero no hay movimientos (lista vacía),
    // consultamos el nombre real en la BD para que el reporte no diga "null"
    const account = await this.prisma.account.findUnique({
      where: { id: accountId, userId }, // Aseguramos que sea del usuario
      select: { name: true },
    });

    return account?.name || 'Cuenta Desconocida';
  }
  // ===========================================================================
  // 1. EXCEL
  // ===========================================================================
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

  // ===========================================================================
  // 2. CSV
  // ===========================================================================
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

  // ===========================================================================
  // 3. PDF TABULAR (Nativo / Rápido)
  // ===========================================================================
  async exportNativePdf(userId: string, res: Response, accountId?: string) {
    this.logger.logOperation('Export Native PDF (Table)', {
      userId,
      accountId,
    });
    const start = Date.now();

    const transactions = await this.getTransactionsData(userId, accountId);
    const accountName = await this.resolveAccountName(
      userId,
      accountId,
      transactions,
    );

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
      subtitle: accountName ? `Cuenta: ${accountName}` : 'Todas las cuentas',
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

        // Columna 5 es Monto
        if (indexColumn === 5) {
          doc.fillColor(rowData.type === 'Gasto' ? 'red' : 'green');
        } else {
          doc.fillColor('black');
        }
        return doc;
      },
    });

    doc.end();

    this.logger.logSuccess('Native PDF generated', {
      rows: transactions.length,
      time: `${Date.now() - start}ms`,
    });
  }

  // ===========================================================================
  // 4. PDF VISUAL (Puppeteer / Bonito) - Código Completo 🎨
  // ===========================================================================
  async exportVisualPdf(userId: string, res: Response, accountId?: string) {
    // 1. SEGURIDAD: Verificar si Puppeteer está listo
    if (!this.browser) {
      this.logger.warn('Puppeteer no está inicializado. Fallando a error 503.');
      res.status(503).json({
        message:
          'El servicio de reportes visuales no está disponible. Intente más tarde.',
        error: 'PUPPETEER_NOT_READY',
      });
      return;
    }

    this.logger.logOperation('Export Visual PDF (Puppeteer)', {
      userId,
      accountId,
    });
    const start = Date.now();

    try {
      // 2. OBTENER DATOS
      const transactions = await this.getTransactionsData(userId, accountId);
      const accountName = await this.resolveAccountName(
        userId,
        accountId,
        transactions,
      );

      // 3. PROCESAR DATOS (Cálculos + Formato)
      let totalIncome = 0;
      let totalExpense = 0;

      const formattedTransactions = transactions.map((t) => {
        const amountNum = Number(t.amount); // Convertir a número para sumar

        // Sumar a los totales
        if (t.type === 'INCOME') totalIncome += amountNum;
        else if (t.type === 'EXPENSE') totalExpense += amountNum;

        // Retornar objeto formateado para el HTML
        return {
          date: t.date.toLocaleDateString(), // Ej: 16/02/2026
          type: t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
          category: t.category?.name || 'General',
          account: t.account?.name || '-',
          description: t.description || '',
          amount: amountNum.toFixed(2), // Ej: "1500.00"
          currency: t.currency || t.account?.currency || '$',
          // Clases CSS para el template
          badgeClass: t.type === 'INCOME' ? 'badge-income' : 'badge-expense',
          colorClass: t.type === 'INCOME' ? 'text-green' : 'text-red',
        };
      });

      // 4. PREPARAR EL HTML (Handlebars)
      const isFiltered =
        accountId && accountId !== 'null' && accountId.trim() !== '';

      const template = Handlebars.compile(visualReportTemplate);
      const htmlContent = template({
        generatedDate:
          new Date().toLocaleDateString() +
          ' ' +
          new Date().toLocaleTimeString(),
        userId: userId.substring(0, 8) + '...', // ID corto por privacidad
        accountFilter: isFiltered ? `${accountName}` : null,

        // Totales calculados arriba
        totalIncome: totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        netBalance: (totalIncome - totalExpense).toFixed(2),

        // Listado
        totalTransactions: transactions.length,
        transactions: formattedTransactions,
      });

      // 5. GENERAR PDF (Puppeteer)
      // Usamos una nueva pestaña (Page) sobre el navegador compartido
      const page = await this.browser.newPage();

      // 'domcontentloaded' es rápido: solo espera que el HTML esté listo
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true, // Para que se vean los colores de fondo
        margin: { top: '20px', bottom: '40px', left: '20px', right: '20px' },
      });

      // IMPORTANTE: Cerrar la pestaña para liberar memoria
      await page.close();

      // 6. ENVIAR RESPUESTA
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
      });

      // Enviamos el buffer binario
      res.end(pdfBuffer);

      this.logger.logSuccess('Visual PDF generated', {
        rows: transactions.length,
        time: `${Date.now() - start}ms`,
      });
    } catch (error) {
      this.logger.error('Error generating Visual PDF', (error as Error).stack);

      // Solo enviamos error si la respuesta no se envió ya
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generando el PDF visual' });
      }
    }
  }
}
