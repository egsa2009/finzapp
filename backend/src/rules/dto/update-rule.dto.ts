import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
