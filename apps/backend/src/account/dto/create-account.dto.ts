import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsHexColor,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// 👇 IMPORTANTE: Importamos el Enum de Prisma
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Nombre de la cuenta',
    example: 'Billetera Principal',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // 👇 NUEVO CAMPO CRÍTICO
  @ApiProperty({
    description: 'Tipo de cuenta',
    enum: AccountType,
    example: AccountType.WALLET,
  })
  @IsEnum(AccountType, {
    message: 'Type must be WALLET, SAVINGS, INVESTMENT or CREDIT_CARD',
  })
  type: AccountType;

  @ApiProperty({
    description: 'Moneda de la cuenta',
    example: 'ARS',
    enum: ['ARS', 'USD', 'EUR'],
  })
  @IsString()
  @IsEnum(['ARS', 'USD', 'EUR'])
  currency: string;

  @ApiPropertyOptional({
    description: 'Color identificador (Hex)',
    example: '#10B981',
  })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Icono identificador',
    default: 'wallet',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  // 👇 Estos ahora son opcionales y semánticamente ligados a SAVINGS
  @ApiPropertyOptional({ description: 'Monto objetivo (Solo para Metas)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  targetAmount?: number;

  @ApiPropertyOptional({ description: 'Fecha límite (Solo para Metas)' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
