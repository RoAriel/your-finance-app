import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SavingsService } from './savings.service';
import { CreateSavingsAccountDto } from './dto/create-saving.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Revisa tu ruta de guards
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // Tu decorador arreglado
import { TransferDto } from './dto/transfer.dto';
import { DepositDto } from './dto/deposit.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';

@ApiTags('Savings') // Para agruparlo en Swagger
@ApiBearerAuth() // Pone el candadito en Swagger
@UseGuards(JwtAuthGuard) // Protege TODAS las rutas de este controlador
@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cuenta de ahorro' })
  create(
    @Body() createSavingsDto: CreateSavingsAccountDto,
    @CurrentUser('id') userId: string, // Obtenemos ID del token
  ) {
    return this.savingsService.create(createSavingsDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas mis cuentas de ahorro' })
  findAll(@CurrentUser('id') userId: string) {
    return this.savingsService.findAll(userId);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transferir fondos entre cuentas' })
  transfer(
    @Body() transferDto: TransferDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.savingsService.transfer(transferDto, userId);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Depositar dinero (Para pruebas)' })
  deposit(
    @Param('id') id: string,
    @Body() depositDto: DepositDto, // <--- Usamos el DTO completo aquí
    @CurrentUser('id') userId: string,
  ) {
    // Pasamos depositDto.amount al servicio
    return this.savingsService.deposit(id, depositDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una meta de ahorro' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.savingsService.remove(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una meta de ahorro' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSavingDto, // Asegurate de tener este DTO (o usa CreateSavingsDto con PartialType)
  ) {
    return this.savingsService.update(userId, id, dto);
  }
}
