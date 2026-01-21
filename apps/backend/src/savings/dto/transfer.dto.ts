import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
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
}
