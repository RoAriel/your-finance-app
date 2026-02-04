import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  // 2. Validación estricta con el nuevo Enum
  @IsEnum(TransactionType, {
    message: 'Type must be INCOME, EXPENSE or TRANSFER',
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Monto del movimiento',
    minimum: 0.01,
    example: 1500.75,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Tipo de moneda',
    example: 'ARS',
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string = 'ARS';

  @ApiProperty({
    description: 'Descripción del movimiento',
    example: 'Compra de comestibles',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Fecha del movimiento',
    example: '2023-10-05T14:48:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'ID de la categoría asociada al movimiento',
    example: '92b77be3-a14a-462c-a291-7eff27cbcf47',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description:
      'ID de la cuenta (Wallet o Savings) donde impacta el movimiento',
    example: 'uuid-de-la-cuenta',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;
}
