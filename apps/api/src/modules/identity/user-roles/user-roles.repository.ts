import { Injectable } from '@nestjs/common';
import type { UserRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UserRolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assign(data: Prisma.UserRoleCreateInput): Promise<UserRole> {
    return this.prisma.userRole.create({ data });
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.userRole.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByUser(userId: string): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { userId, isActive: true },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<UserRole | null> {
    return this.prisma.userRole.findUnique({ where: { id } });
  }

  async hasRole(userId: string, roleId: string): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: { userId, roleId, isActive: true },
    });
    return count > 0;
  }
}
