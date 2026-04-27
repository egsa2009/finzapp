import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;
}
