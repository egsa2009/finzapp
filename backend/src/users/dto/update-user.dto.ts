import { IsOptional, IsString, IsNumber, IsDecimal, Min, Max } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  pay_day?: number;

  @IsOptional()
  monthly_budget?: string | Decimal;
}
