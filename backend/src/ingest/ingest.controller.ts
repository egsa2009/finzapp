import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestSmsDto } from './dto/ingest-sms.dto';
import { IngestPushDto } from './dto/ingest-push.dto';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

@ApiTags('Ingest')
@Controller('ingest')
export class IngestController {
  constructor(private ingestService: IngestService) {}

  @Post('sms')
  @ApiOperation({ summary: 'Ingest SMS notification' })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'API Key for SMS ingest',
    required: true,
  })
  @ApiHeader({
    name: 'X-User-ID',
    description: 'User ID',
    required: true,
  })
  async ingestSms(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-user-id') userId: string,
    @Body() ingestSmsDto: IngestSmsDto,
  ) {
    if (!apiKey) {
      throw new BadRequestException('X-API-Key header is required');
    }

    if (!userId) {
      throw new BadRequestException('X-User-ID header is required');
    }

    // Validate API key
    if (apiKey !== process.env.INGEST_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.ingestService.processSms(userId, ingestSmsDto);
  }

  @Post('push')
  @ApiOperation({ summary: 'Ingest push notification' })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'API Key for push ingest',
    required: true,
  })
  @ApiHeader({
    name: 'X-User-ID',
    description: 'User ID',
    required: true,
  })
  async ingestPush(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-user-id') userId: string,
    @Body() ingestPushDto: IngestPushDto,
  ) {
    if (!apiKey) {
      throw new BadRequestException('X-API-Key header is required');
    }

    if (!userId) {
      throw new BadRequestException('X-User-ID header is required');
    }

    // Validate API key
    if (apiKey !== process.env.INGEST_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.ingestService.processPush(userId, ingestPushDto);
  }
}
