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
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'List transactions for current billing period' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String, enum: ['INCOME', 'EXPENSE'] })
  async getTransactions(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
  ) {
    return this.transactionsService.getTransactions(
      req.user.id,
      page,
      limit,
      categoryId,
      type,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create a manual transaction' })
  async createTransaction(
    @Request() req,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(
      req.user.id,
      createTransactionDto,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update or confirm a transaction category' })
  async updateTransaction(
    @Request() req,
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(
      req.user.id,
      transactionId,
      updateTransactionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Delete a transaction' })
  async deleteTransaction(
    @Request() req,
    @Param('id') transactionId: string,
  ) {
    return this.transactionsService.deleteTransaction(req.user.id, transactionId);
  }
}
