import { Controller, Get, Res, UseGuards, Query } from '@nestjs/common'; // 👈 Importar Query
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiQuery, // 👈 Opcional: Para documentar en Swagger
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
  @ApiQuery({ name: 'accountId', required: false, type: String }) // 👈 Documentación Swagger
  async getDashboard(
    @CurrentUser('id') userId: string,
    @Query('accountId') accountId?: string, // 👈 Capturamos el Query Param
  ) {
    return this.analyticsService.getDashboardStats(userId, accountId);
  }

  // ... (exportTransactions se mantiene igual)
  @Get('export')
  @ApiOperation({ summary: 'Descargar Excel de transacciones' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportTransactions(
    @CurrentUser('id') userId: string,
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

    await this.exportsService.exportTransactionsToExcel(userId, res);
  }
}
