import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all budgets' })
  async getBudgets(@Request() req) {
    return this.budgetsService.getBudgets(req.user.id);
  }

  @Get('by-month')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get budgets for a specific month' })
  @ApiQuery({ name: 'month', type: String, example: '2024-01-01' })
  async getBudgetsByMonth(
    @Request() req,
    @Query('month') month: string,
  ) {
    return this.budgetsService.getBudgetsByMonth(req.user.id, new Date(month));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create a new budget' })
  async createBudget(
    @Request() req,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetsService.createBudget(req.user.id, createBudgetDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update a budget' })
  async updateBudget(
    @Request() req,
    @Param('id') budgetId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.updateBudget(req.user.id, budgetId, updateBudgetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Delete a budget' })
  async deleteBudget(
    @Request() req,
    @Param('id') budgetId: string,
  ) {
    return this.budgetsService.deleteBudget(req.user.id, budgetId);
  }
}
