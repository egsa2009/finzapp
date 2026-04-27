import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

const SYSTEM_CATEGORIES = [
  { name: 'Hogar', icon: 'home', color: '#FF6B6B' },
  { name: 'Transporte', icon: 'car', color: '#4ECDC4' },
  { name: 'Bienestar', icon: 'heart', color: '#FFD93D' },
  { name: 'Deudas', icon: 'credit-card', color: '#95E1D3' },
  { name: 'Ahorro', icon: 'piggy-bank', color: '#F38181' },
  { name: 'Generosidad', icon: 'gift', color: '#AA96DA' },
  { name: 'Otros', icon: 'tag', color: '#FCBAD3' },
];

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getCategories(userId: string) {
    // Get system categories
    const systemCategories = await this.prisma.category.findMany({
      where: { is_system: true },
      orderBy: { name: 'asc' },
    });

    // Get user custom categories
    const userCategories = await this.prisma.category.findMany({
      where: { user_id: userId, is_system: false },
      orderBy: { created_at: 'desc' },
    });

    return [...systemCategories, ...userCategories];
  }

  async createCategory(userId: string, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        user_id: userId,
        name: createCategoryDto.name,
        icon: createCategoryDto.icon,
        color: createCategoryDto.color,
        is_system: false,
      },
    });
  }

  async seedSystemCategories() {
    for (const category of SYSTEM_CATEGORIES) {
      const exists = await this.prisma.category.findFirst({
        where: { name: category.name, is_system: true },
      });

      if (!exists) {
        await this.prisma.category.create({
          data: {
            name: category.name,
            icon: category.icon,
            color: category.color,
            is_system: true,
          },
        });
      }
    }
  }
}
