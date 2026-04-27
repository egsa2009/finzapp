import { IsString, IsOptional } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  limit_amount?: string;
}
