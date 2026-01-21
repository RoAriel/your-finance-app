import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsHexColor,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
