import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // 🔒 Seguridad primero
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo presupuesto mensual' })
  create(
    @Body() createBudgetDto: CreateBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.create(createBudgetDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Ver reporte de presupuestos (Progreso vs Límite)' })
  findAll(@CurrentUser('id') userId: string) {
    return this.budgetsService.findAll(userId);
  }
}
