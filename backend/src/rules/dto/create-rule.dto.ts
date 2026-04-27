import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  pattern: string;

  @IsString()
  @IsNotEmpty()
  category_id: string;

  @IsOptional()
  @IsNumber()
  priority?: number;
}
