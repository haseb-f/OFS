import { Injectable } from '@nestjs/common';
import type { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findMany(
    { page = 1, limit = 20 }: PaginationParams,
    where?: Prisma.UserWhereInput,
  ): Promise<PaginatedResult<User>> {
    const skip = (page - 1) * limit;
    const baseWhere: Prisma.UserWhereInput = { deletedAt: null, ...where };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: baseWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: baseWhere }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  }
}
