import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async getRules(userId: string) {
    return this.prisma.classificationRule.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { priority: 'desc' },
    });
  }

  async createRule(userId: string, createRuleDto: CreateRuleDto) {
    const { pattern, category_id, priority } = createRuleDto;

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

    // Validate regex pattern
    try {
      new RegExp(pattern);
    } catch (error) {
      throw new BadRequestException('Invalid regex pattern');
    }

    return this.prisma.classificationRule.create({
      data: {
        user_id: userId,
        category_id,
        pattern,
        priority: priority || 100,
        is_active: true,
      },
      include: { category: true },
    });
  }

  async updateRule(userId: string, ruleId: string, updateData: any) {
    const rule = await this.prisma.classificationRule.findFirst({
      where: {
        id: ruleId,
        user_id: userId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    // If category is being updated, validate it
    if (updateData.category_id) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateData.category_id,
          OR: [
            { user_id: userId },
            { is_system: true },
          ],
        },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // If pattern is being updated, validate it
    if (updateData.pattern) {
      try {
        new RegExp(updateData.pattern);
      } catch (error) {
        throw new BadRequestException('Invalid regex pattern');
      }
    }

    return this.prisma.classificationRule.update({
      where: { id: ruleId },
      data: updateData,
      include: { category: true },
    });
  }

  async deleteRule(userId: string, ruleId: string) {
    const rule = await this.prisma.classificationRule.findFirst({
      where: {
        id: ruleId,
        user_id: userId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    return this.prisma.classificationRule.delete({
      where: { id: ruleId },
    });
  }

  async toggleRule(userId: string, ruleId: string) {
    const rule = await this.prisma.classificationRule.findFirst({
      where: {
        id: ruleId,
        user_id: userId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    return this.prisma.classificationRule.update({
      where: { id: ruleId },
      data: { is_active: !rule.is_active },
      include: { category: true },
    });
  }
}
