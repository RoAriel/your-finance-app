import { Controller, Get, Res, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './services/analytics.service';
import { ExportsService } from './services/exports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly exportsService: ExportsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener métricas principales del Dashboard' })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  async getDashboard(
    @CurrentUser('id') userId: string,
    @Query('accountId') accountId?: string,
  ) {
    return this.analyticsService.getDashboardStats(userId, accountId);
  }

  // 1. EXCEL
  @Get('export')
  @ApiOperation({ summary: 'Descargar Excel de transacciones' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiQuery({ name: 'accountId', required: false, type: String })
  async exportTransactions(
    @CurrentUser('id') userId: string,
    @Query('accountId') accountId: string | undefined,
    @Res() res: Response,
  ) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="movimientos.xlsx"',
    );

    await this.exportsService.exportTransactionsToExcel(userId, res, accountId);
  }

  // 2. CSV
  @Get('export/csv')
  @ApiOperation({ summary: 'Descargar CSV de transacciones' })
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'accountId', required: false, type: String })
  async exportCsv(
    @CurrentUser('id') userId: string,
    @Query('accountId') accountId: string | undefined,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="movimientos.csv"',
    );

    await this.exportsService.exportTransactionsToCsv(userId, res, accountId);
  }

  // 3. PDF TABULAR (Rápido - Native)
  @Get('export/pdf/table')
  @ApiOperation({
    summary: 'Descarga rápida de listado tabular (Optimizado para volumen)',
  })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'accountId', required: false, type: String })
  async exportPdfTable(
    @CurrentUser('id') userId: string,
    @Query('accountId') accountId: string | undefined,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="movimientos_tabla.pdf"',
    );

    // Llamamos al método nativo (PDFKit Table)
    await this.exportsService.exportNativePdf(userId, res, accountId);
  }

  // 4. PDF VISUAL (Bonito - Puppeteer)
  @Get('export/pdf/visual')
  @ApiOperation({ summary: 'Descarga de reporte visual con diseño (HTML/CSS)' })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'accountId', required: false, type: String })
  async exportPdfVisual(
    @CurrentUser('id') userId: string,
    @Res() res: Response,
    @Query('accountId') accountId?: string,
  ) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_visual.pdf"',
    );
    console.log(
      '🔍 DEBUG CONTROLLER - Recibido accountId:',
      accountId,
      '| Tipo:',
      typeof accountId,
    );
    // Llamamos al método visual (Puppeteer placeholder)
    await this.exportsService.exportVisualPdf(userId, res, accountId);
  }
}
