import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { TransactionType } from './create-transaction.dto';

export class QueryTransactionDto {
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
  @IsString()
  categoryId?: string;
}
