import { IsNumber, IsPositive } from 'class-validator';
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
}
