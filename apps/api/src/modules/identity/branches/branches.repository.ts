import { Injectable } from '@nestjs/common';
import type { Branch, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class BranchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BranchCreateInput): Promise<Branch> {
    return this.prisma.branch.create({ data });
  }

  async findById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findFirst({ where: { id, deletedAt: null } });
  }

  async findByCompany(
    companyId: string,
    { page = 1, limit = 20 }: PaginationParams,
  ): Promise<PaginatedResult<Branch>> {
    const skip = (page - 1) * limit;
    const where: Prisma.BranchWhereInput = { companyId, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.branch.findMany({ where, skip, take: limit, orderBy: { nameAr: 'asc' } }),
      this.prisma.branch.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Prisma.BranchUpdateInput): Promise<Branch> {
    return this.prisma.branch.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
