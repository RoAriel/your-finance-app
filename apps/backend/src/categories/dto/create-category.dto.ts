import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
  BOTH = 'both',
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
}
