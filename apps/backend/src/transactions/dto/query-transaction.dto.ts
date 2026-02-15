import {
  IsString,
  IsEnum,
  IsDateString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator'; // Quitamos IsNotEmpty que conflictuaba con IsOptional
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
  EUR = 'EUR',
}

export class QueryTransactionDto extends PaginationDto {
  // ... (otros campos iguales: search, type, startDate, endDate, categoryId, currency) ...
  @ApiPropertyOptional({ description: 'Buscar por descripción' })
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  // ... (month y year iguales) ...
  @ApiPropertyOptional({ description: 'Mes para filtrar (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ description: 'Año para filtrar (ej: 2026)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;

  // 👇 ACTUALIZADO: Filtro por Cuenta
  @ApiPropertyOptional({ description: 'Filtrar por ID de cuenta' })
  @IsOptional()
  @IsUUID() // 👈 Más estricto que IsString
  accountId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
