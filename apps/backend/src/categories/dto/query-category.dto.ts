import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
  BOTH = 'both',
}

export class QueryCategoryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
