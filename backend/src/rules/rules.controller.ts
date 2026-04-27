import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Rules')
@Controller('rules')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all classification rules' })
  async getRules(@Request() req) {
    return this.rulesService.getRules(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create a new classification rule' })
  async createRule(
    @Request() req,
    @Body() createRuleDto: CreateRuleDto,
  ) {
    return this.rulesService.createRule(req.user.id, createRuleDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update a classification rule' })
  async updateRule(
    @Request() req,
    @Param('id') ruleId: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ) {
    return this.rulesService.updateRule(req.user.id, ruleId, updateRuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Delete a classification rule' })
  async deleteRule(
    @Request() req,
    @Param('id') ruleId: string,
  ) {
    return this.rulesService.deleteRule(req.user.id, ruleId);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Toggle rule active status' })
  async toggleRule(
    @Request() req,
    @Param('id') ruleId: string,
  ) {
    return this.rulesService.toggleRule(req.user.id, ruleId);
  }
}
