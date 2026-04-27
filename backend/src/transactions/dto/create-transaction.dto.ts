import { IsString, IsNotEmpty, IsDecimal, IsEnum, IsOptional, IsDate, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsDecimal()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['INCOME', 'EXPENSE'])
  @IsNotEmpty()
  transaction_type: string;

  @IsString()
  @IsNotEmpty()
  category_id: string;

  @IsOptional()
  @IsString()
  merchant?: string;

  @IsDateString()
  @IsNotEmpty()
  transaction_at: Date;
}
