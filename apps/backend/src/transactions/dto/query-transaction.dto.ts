import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
  EUR = 'EUR',
}

export class QueryTransactionDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}
