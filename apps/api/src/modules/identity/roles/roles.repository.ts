import { Injectable } from '@nestjs/common';
import type { Role, Prisma, RoleCode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async findByCode(code: RoleCode): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { code } });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }

  async existsByCode(code: RoleCode, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.role.count({
      where: { code, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  }
}
