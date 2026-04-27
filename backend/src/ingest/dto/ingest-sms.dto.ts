import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class IngestSmsDto {
  @IsString()
  @IsNotEmpty()
  raw_text: string;

  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsDateString()
  @IsNotEmpty()
  received_at: string;
}
