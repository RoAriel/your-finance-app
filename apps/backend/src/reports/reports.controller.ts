import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import type { Response } from 'express'; // 👈 Importante: Tipado de Express
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export')
  @ApiOperation({ summary: 'Descargar reporte de transacciones en Excel' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ) // 👈 Le avisa a Swagger qué devuelve
  async exportTransactions(
    @CurrentUser('id') userId: string,
    @Res() res: Response, // 👈 Inyectamos la respuesta nativa de Express
  ) {
    // 1. Configuramos los Headers para descarga
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="transactions.xlsx"',
    );

    // 2. Llamamos al servicio pasando el objeto 'res' para que escriba el stream
    await this.reportsService.getTransactionsReport(userId, res);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Obtener datos resumidos para gráficos (Dashboard)',
  })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.reportsService.getDashboardStats(userId);
  }
}
