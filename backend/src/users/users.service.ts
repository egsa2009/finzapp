import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        pay_day: true,
        monthly_budget: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: updateUserDto.full_name,
        pay_day: updateUserDto.pay_day,
        monthly_budget: updateUserDto.monthly_budget,
        phone: updateUserDto.phone,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        pay_day: true,
        monthly_budget: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }
}
