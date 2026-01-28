import { IsString, IsOptional, IsInt, Min, Max, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nombre del usuario' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiPropertyOptional({ description: 'Moneda preferida (ej: ARS, USD)' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Día de inicio del mes fiscal (1-28)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  fiscalStartDay?: number;
}
