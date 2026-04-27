import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async getBudgets(userId: string) {
    return this.prisma.budget.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { month: 'desc' },
    });
  }

  async getBudgetsByMonth(userId: string, month: Date) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return this.prisma.budget.findMany({
      where: {
        user_id: userId,
        month: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: { category: true },
    });
  }

  async createBudget(userId: string, createBudgetDto: CreateBudgetDto) {
    const { category_id, limit_amount, month } = createBudgetDto;

    // Validate category exists and belongs to user
    const category = await this.prisma.category.findFirst({
      where: {
        id: category_id,
        OR: [
          { user_id: userId },
          { is_system: true },
        ],
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const monthDate = new Date(month);
    monthDate.setDate(1);

    return this.prisma.budget.create({
      data: {
        user_id: userId,
        category_id,
        month: monthDate,
        limit_amount: limit_amount.toString(),
      },
      include: { category: true },
    });
  }

  async updateBudget(userId: string, budgetId: string, updateData: any) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        user_id: userId,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
      include: { category: true },
    });
  }

  async deleteBudget(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        user_id: userId,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.delete({
      where: { id: budgetId },
    });
  }
}
