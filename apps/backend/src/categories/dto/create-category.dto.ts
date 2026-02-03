import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CategoryType {
  INCOME = 'INCOME', // <--- Coincide con Prisma
  EXPENSE = 'EXPENSE', // <--- Coincide con Prisma
  BOTH = 'BOTH', // <--- Coincide con Prisma
}

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEnum(CategoryType, { message: 'Type must be income, expense, or both' })
  type: CategoryType;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex code (e.g., #FF5733)',
  })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    description: '¿Es un gasto fijo mensual? (true: Alquiler, false: Cine)',
    example: true,
    default: false,
  })
  @IsOptional() // Opcional porque tiene default en BD
  @IsBoolean()
  isFixed?: boolean;

  @ApiPropertyOptional({
    description: 'ID de la categoría padre (si es una subcategoría)',
    example: 'uuid-de-servicios',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
