import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import axios from 'axios';

@Injectable()
export class TransactionsService {
  constructor(
    private repository: TransactionsRepository,
    private prisma: PrismaService,
  ) {}

  async createTransaction(userId: string, createTransactionDto: CreateTransactionDto) {
    // Validate category exists and belongs to user
    const category = await this.prisma.category.findFirst({
      where: {
        id: createTransactionDto.category_id,
        OR: [
          { user_id: userId },
          { is_system: true },
        ],
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.repository.createTransaction(userId, createTransactionDto);
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 20, categoryId?: string, type?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let result = await this.repository.getTransactionsByPeriod(userId, user.pay_day, page, limit);

    // Apply filters
    if (categoryId) {
      result.data = result.data.filter(t => t.category_id === categoryId);
    }

    if (type) {
      result.data = result.data.filter(t => t.transaction_type === type);
    }

    return result;
  }

  async updateTransaction(userId: string, transactionId: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.repository.getTransactionById(userId, transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updateData: any = {};

    if (updateTransactionDto.category_id) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateTransactionDto.category_id,
          OR: [
            { user_id: userId },
            { is_system: true },
          ],
        },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }

      updateData.category_id = updateTransactionDto.category_id;
    }

    if (updateTransactionDto.description) {
      updateData.description = updateTransactionDto.description;
    }

    if (updateTransactionDto.confirmed !== undefined) {
      updateData.confirmed = updateTransactionDto.confirmed;
    }

    // If category was updated and confirmed=true, send feedback to NLP service
    if (updateData.category_id && updateData.confirmed && transaction.raw_text) {
      try {
        const nlpServiceUrl = process.env.NLP_SERVICE_URL || 'http://nlp-service:8000';
        await axios.post(
          `${nlpServiceUrl}/feedback`,
          {
            raw_text: transaction.raw_text,
            category: updateData.category_id,
            user_id: userId,
          },
        );
      } catch (error) {
        console.error('Failed to send feedback to NLP service:', error);
      }
    }

    return this.repository.updateTransaction(userId, transactionId, updateData);
  }

  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await this.repository.getTransactionById(userId, transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.repository.deleteTransaction(userId, transactionId);
  }
}
