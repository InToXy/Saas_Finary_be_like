import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        subscription: true,
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.userProfile.update({
      where: { userId },
      data,
    });
  }
}
