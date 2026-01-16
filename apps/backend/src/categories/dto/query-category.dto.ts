import { IsOptional, IsIn } from 'class-validator';

export class QueryCategoryDto {
  @IsOptional()
  @IsIn(['income', 'expense', 'both'])
  type?: 'income' | 'expense' | 'both';
}
