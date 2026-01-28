import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Monto a depositar',
    example: 1000,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Ahorro mensual', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
