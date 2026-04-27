import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class IngestPushDto {
  @IsString()
  @IsNotEmpty()
  raw_text: string;

  @IsString()
  @IsNotEmpty()
  app_package: string;

  @IsDateString()
  @IsNotEmpty()
  received_at: string;
}
