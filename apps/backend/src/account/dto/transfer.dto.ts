import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({
    description: 'ID de la cuenta origen',
    example: 'uuid-origen',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceAccountId: string;

  @ApiProperty({
    description: 'ID de la cuenta destino',
    example: 'uuid-destino',
  })
  @IsUUID()
  @IsNotEmpty()
  targetAccountId: string;

  @ApiProperty({
    description: 'Monto a transferir',
    example: 500.0,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Nota de la transferencia',
    example: 'Pago de cena',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Fecha de la transferencia (opcional)',
    example: '2023-10-27T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
