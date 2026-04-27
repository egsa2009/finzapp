import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get financial summary for current period' })
  async getSummary(@Request() req) {
    return this.reportsService.getSummary(req.user.id);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get spending breakdown by category' })
  async getCategoriesReport(@Request() req) {
    return this.reportsService.getCategoriesReport(req.user.id);
  }

  @Get('ants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get small spending habits analysis' })
  async getAntsReport(@Request() req) {
    return this.reportsService.getAntsReport(req.user.id);
  }
}
