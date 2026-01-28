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

export class CreateSavingsAccountDto {
  @ApiProperty({
    description: 'Nombre de la cuenta (ej: Ahorros para Vacaciones)',
    example: 'Fondo de Emergencia',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Moneda de la cuenta',
    example: 'ARS',
    enum: ['ARS', 'USD', 'EUR'], // Esto crea un dropdown en Swagger
  })
  @IsString()
  @IsEnum(['ARS', 'USD', 'EUR'], {
    message: 'Currency must be ARS, USD, or EUR',
  })
  currency: string;

  @ApiProperty({
    description: 'Color identificador para el frontend (Hexadecimal)',
    example: '#2ecc71',
    required: false,
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

  // 👇 NUEVOS CAMPOS
  @ApiPropertyOptional({ description: 'Monto objetivo a alcanzar' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  targetAmount?: number;

  @ApiPropertyOptional({ description: 'Fecha límite para la meta (ISO 8601)' })
  @IsOptional()
  @IsDateString() // Valida que sea un string tipo fecha "2026-12-31"
  targetDate?: string; // Lo recibimos como string y Prisma lo convierte a Date
}
