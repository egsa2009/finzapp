import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  limit_amount: string;

  @IsDateString()
  @IsNotEmpty()
  month: string;
}
