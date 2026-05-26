import { Injectable } from '@nestjs/common';
import type { Company, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CompanyCreateInput): Promise<Company> {
    return this.prisma.company.create({ data });
  }

  async findById(id: string): Promise<Company | null> {
    return this.prisma.company.findFirst({ where: { id, deletedAt: null } });
  }

  async findByBrand(
    brandId: string,
    { page = 1, limit = 20 }: PaginationParams,
  ): Promise<PaginatedResult<Company>> {
    const skip = (page - 1) * limit;
    const where: Prisma.CompanyWhereInput = { brandId, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({ where, skip, take: limit, orderBy: { nameAr: 'asc' } }),
      this.prisma.company.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Prisma.CompanyUpdateInput): Promise<Company> {
    return this.prisma.company.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
