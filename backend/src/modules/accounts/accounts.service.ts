import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      include: { assets: true },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.account.create({
      data: { ...data, userId },
    });
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.account.update({
      where: { id, userId },
      data,
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.account.delete({
      where: { id, userId },
    });
  }
}
