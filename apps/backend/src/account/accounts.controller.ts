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
import { AccountsService } from './accounts.service'; // 👈 Renombrado
import { CreateAccountDto } from './dto/create-account.dto'; // 👈 Renombrado
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransferDto } from './dto/transfer.dto';
import { DepositDto } from './dto/deposit.dto';
import { UpdateAccountDto } from './dto/update-account.dto'; // 👈 Renombrado

@ApiTags('Accounts') // 👈 Etiqueta actualizada para Swagger
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts') // 👈 Ruta actualizada: /accounts
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cuenta (Wallet o Savings)' })
  create(@Body() dto: CreateAccountDto, @CurrentUser('id') userId: string) {
    return this.accountsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las cuentas' })
  findAll(@CurrentUser('id') userId: string) {
    return this.accountsService.findAll(userId);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transferir entre cuentas' })
  transfer(@Body() dto: TransferDto, @CurrentUser('id') userId: string) {
    return this.accountsService.transfer(dto, userId);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Depositar fondos (Test)' })
  deposit(
    @Param('id') id: string,
    @Body() dto: DepositDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.accountsService.deposit(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una cuenta' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.accountsService.remove(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cuenta' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(userId, id, dto);
  }
}
