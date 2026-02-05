import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre de pila' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string; // 👈 ¡Esto es lo que falta!

  @ApiPropertyOptional({ description: 'Nuevo apellido' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string; // 👈 ¡Y esto!

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
