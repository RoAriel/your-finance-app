import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({ description: 'Monto límite a gastar', example: 50000.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Mes del presupuesto (1-12)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Año del presupuesto', example: 2026 })
  @IsInt()
  @Min(2024)
  year: number;

  @ApiProperty({
    description: 'ID de la categoría a controlar',
    example: 'uuid-de-categoria',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
