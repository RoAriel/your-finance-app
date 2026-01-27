import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateBudgetDto } from './dto/update-budget.dto';

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
  findAll(
    // 1. MANTENEMOS tu decorador para sacar el ID del usuario seguro
    @CurrentUser('id') userId: string,

    // 2. AGREGAMOS los Query params para el filtro (vienen como string desde la URL)
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    // 3. Convertimos a número antes de pasar al servicio (si vienen definidos)
    const monthNum = month ? Number(month) : undefined;
    const yearNum = year ? Number(year) : undefined;

    // 4. Llamamos al servicio con los 3 datos
    return this.budgetsService.findAll(userId, monthNum, yearNum);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar un presupuesto existente' })
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.update(id, updateBudgetDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un presupuesto' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.budgetsService.remove(id, userId);
  }
}
