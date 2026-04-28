import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  async createTransaction(userId: string, createTransactionDto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        user_id: userId,
        category_id: createTransactionDto.category_id,
        amount: createTransactionDto.amount.toString(),
        description: createTransactionDto.description,
        transaction_type: createTransactionDto.transaction_type as TransactionType,
        transaction_source: 'MANUAL',
        merchant: createTransactionDto.merchant,
        transaction_at: createTransactionDto.transaction_at,
        confirmed: true,
      },
      include: {
        category: true,
      },
    });
  }

  async getTransactionsByPeriod(userId: string, payDay: number, page: number = 1, limit: number = 20) {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    // Calculate period based on pay_day
    if (now.getDate() >= payDay) {
      // We're in the current payment period
      periodStart = new Date(now.getFullYear(), now.getMonth(), payDay);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, payDay - 1);
    } else {
      // We're in the previous payment period
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, payDay);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), payDay - 1);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          user_id: userId,
          transaction_at: {
            gte: periodStart,
            lte: endOfDay(periodEnd),
          },
          deleted_at: null,
        },
        include: {
          category: true,
        },
        orderBy: { transaction_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: {
          user_id: userId,
          transaction_at: {
            gte: periodStart,
            lte: endOfDay(periodEnd),
          },
          deleted_at: null,
        },
      }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(userId: string, transactionId: string) {
    return this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        user_id: userId,
      },
      include: {
        category: true,
      },
    });
  }

  async updateTransaction(userId: string, transactionId: string, data: any) {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteTransaction(userId: string, transactionId: string) {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { deleted_at: new Date() },
    });
  }

  async getTransactionsByCategory(userId: string, categoryId: string, startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        category_id: categoryId,
        transaction_at: {
          gte: startDate,
          lte: endOfDay(endDate),
        },
        deleted_at: null,
      },
      orderBy: { transaction_at: 'desc' },
    });
  }

  async getTransactionsByType(userId: string, type: string, startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        transaction_type: type as any,
        transaction_at: {
          gte: startDate,
          lte: endOfDay(endDate),
        },
        deleted_at: null,
      },
      orderBy: { transaction_at: 'desc' },
    });
  }
}
