import { Injectable } from '@nestjs/common';
import type { Brand, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  async findById(id: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({ where: { id, deletedAt: null } });
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({ where: { slug, deletedAt: null } });
  }

  async findMany({ page = 1, limit = 20 }: PaginationParams): Promise<PaginatedResult<Brand>> {
    const skip = (page - 1) * limit;
    const where: Prisma.BrandWhereInput = { deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.brand.findMany({ where, skip, take: limit, orderBy: { nameAr: 'asc' } }),
      this.prisma.brand.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return this.prisma.brand.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.brand.count({
      where: { slug, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  }
}
