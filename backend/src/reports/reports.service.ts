import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { endOfDay, startOfDay, subMonths } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    // Calculate period based on pay_day
    if (now.getDate() >= user.pay_day) {
      periodStart = new Date(now.getFullYear(), now.getMonth(), user.pay_day);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, user.pay_day - 1);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, user.pay_day);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), user.pay_day - 1);
    }

    // Get transactions for the period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        transaction_at: {
          gte: periodStart,
          lte: endOfDay(periodEnd),
        },
        deleted_at: null,
      },
    });

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'INCOME')
      .reduce((sum, t) => sum + new Decimal(t.amount).toNumber(), 0);

    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'EXPENSE')
      .reduce((sum, t) => sum + new Decimal(t.amount).toNumber(), 0);

    const netBalance = totalIncome - totalExpenses;
    const budgetPercentage = user.monthly_budget.toNumber() > 0
      ? (totalExpenses / user.monthly_budget.toNumber()) * 100
      : 0;

    // Project to end of period
    const daysInPeriod = Math.floor((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.floor((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const projectedExpenses = (totalExpenses / daysPassed) * daysInPeriod;

    return {
      period: {
        start: periodStart,
        end: periodEnd,
      },
      totalIncome,
      totalExpenses,
      netBalance,
      budgetLimit: user.monthly_budget.toNumber(),
      budgetPercentage: Math.min(budgetPercentage, 100),
      projectedExpenses: Math.round(projectedExpenses),
      remainingBudget: Math.max(user.monthly_budget.toNumber() - totalExpenses, 0),
    };
  }

  async getCategoriesReport(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    // Calculate period based on pay_day
    if (now.getDate() >= user.pay_day) {
      periodStart = new Date(now.getFullYear(), now.getMonth(), user.pay_day);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, user.pay_day - 1);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, user.pay_day);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), user.pay_day - 1);
    }

    // Get previous period
    const prevPeriodStart = new Date(periodStart);
    prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);
    const prevPeriodEnd = new Date(periodStart);
    prevPeriodEnd.setDate(prevPeriodEnd.getDate() - 1);

    // Get categories with transactions
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { user_id: userId },
          { is_system: true },
        ],
      },
    });

    const categoryReports = await Promise.all(
      categories.map(async (category) => {
        const currentTransactions = await this.prisma.transaction.findMany({
          where: {
            user_id: userId,
            category_id: category.id,
            transaction_type: 'EXPENSE',
            transaction_at: {
              gte: periodStart,
              lte: endOfDay(periodEnd),
            },
            deleted_at: null,
          },
        });

        const prevTransactions = await this.prisma.transaction.findMany({
          where: {
            user_id: userId,
            category_id: category.id,
            transaction_type: 'EXPENSE',
            transaction_at: {
              gte: prevPeriodStart,
              lte: endOfDay(prevPeriodEnd),
            },
            deleted_at: null,
          },
        });

        const currentAmount = currentTransactions.reduce(
          (sum, t) => sum + new Decimal(t.amount).toNumber(),
          0,
        );

        const prevAmount = prevTransactions.reduce(
          (sum, t) => sum + new Decimal(t.amount).toNumber(),
          0,
        );

        const totalExpenses = await this.prisma.transaction.aggregate({
          where: {
            user_id: userId,
            transaction_type: 'EXPENSE',
            transaction_at: {
              gte: periodStart,
              lte: endOfDay(periodEnd),
            },
            deleted_at: null,
          },
          _sum: { amount: true },
        });

        const percentage = totalExpenses._sum.amount
          ? (currentAmount / new Decimal(totalExpenses._sum.amount).toNumber()) * 100
          : 0;

        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryIcon: category.icon,
          categoryColor: category.color,
          amount: currentAmount,
          percentage: Math.round(percentage),
          previousAmount: prevAmount,
          trend: prevAmount > 0 ? ((currentAmount - prevAmount) / prevAmount) * 100 : 0,
        };
      }),
    );

    return categoryReports.filter(r => r.amount > 0).sort((a, b) => b.amount - a.amount);
  }

  async getAntsReport(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    // Calculate period based on pay_day
    if (now.getDate() >= user.pay_day) {
      periodStart = new Date(now.getFullYear(), now.getMonth(), user.pay_day);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, user.pay_day - 1);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, user.pay_day);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), user.pay_day - 1);
    }

    // Get transactions < 30,000 COP
    const smallTransactions = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        transaction_type: 'EXPENSE',
        amount: {
          lt: 30000,
        },
        transaction_at: {
          gte: periodStart,
          lte: endOfDay(periodEnd),
        },
        deleted_at: null,
      },
      include: { category: true },
    });

    // Group by merchant or category and find patterns
    const merchantMap = new Map<string, any[]>();

    for (const transaction of smallTransactions) {
      const key = transaction.merchant || transaction.category_id || 'unknown';
      if (!merchantMap.has(key)) {
        merchantMap.set(key, []);
      }
      merchantMap.get(key)!.push(transaction);
    }

    // Filter to patterns with >= 3 occurrences
    const ants = Array.from(merchantMap.entries())
      .filter(([_, transactions]) => transactions.length >= 3)
      .map(([key, transactions]) => {
        const totalAmount = transactions.reduce(
          (sum, t) => sum + new Decimal(t.amount).toNumber(),
          0,
        );

        const avgAmount = totalAmount / transactions.length;

        // Project to annual
        const daysInPeriod = 30; // Approximate
        const daysUsed = new Set(
          transactions.map(t => t.transaction_at.toDateString()),
        ).size;
        const frequencyPerMonth = daysUsed > 0 ? transactions.length / (daysUsed / 30) : transactions.length;
        const projectedAnnual = totalAmount * 12;

        const formatCOP = (amount: number) =>
          `$${Math.round(amount).toLocaleString('es-CO')}`;

        const savingPerMonth = Math.round(totalAmount * 0.75);
        const savingPerYear = savingPerMonth * 12;

        return {
          key,
          merchant: transactions[0].merchant || 'Sin comercio',
          category: transactions[0].category?.name || 'Otros',
          occurrences: transactions.length,
          totalAmount: Math.round(totalAmount),
          averageAmount: Math.round(avgAmount),
          projectedAnnual: Math.round(projectedAnnual),
          recommendation: `Gastaste ${formatCOP(totalAmount)} en ${transactions.length} transacciones pequeñas este periodo. Proyectado anual: ${formatCOP(projectedAnnual)}. Si reduces este gasto a la mitad, ahorras ${formatCOP(savingPerMonth)}/mes — ${formatCOP(savingPerYear)} al año.`,
        };
      })
      .sort((a, b) => b.projectedAnnual - a.projectedAnnual);

    return {
      count: ants.length,
      ants,
      totalProjectedAnnual: ants.reduce((sum, a) => sum + a.projectedAnnual, 0),
    };
  }
}
