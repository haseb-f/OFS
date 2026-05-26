import { Injectable } from '@nestjs/common';
import type { Permission, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return this.prisma.permission.create({ data });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async findAll(resource?: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { isActive: true, ...(resource ? { resource } : {}) },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  async findByResourceAction(resource: string, action: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { resource_action: { resource, action } } });
  }

  async assignToRole(roleId: string, permissionId: string, grantedBy?: string): Promise<void> {
    await this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      create: { roleId, permissionId, grantedBy: grantedBy ?? null },
      update: {},
    });
  }

  async revokeFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }

  async findByRole(roleId: string): Promise<Permission[]> {
    const rps = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rps.map((rp) => rp.permission);
  }

  async existsByResourceAction(resource: string, action: string): Promise<boolean> {
    const count = await this.prisma.permission.count({ where: { resource, action } });
    return count > 0;
  }
}
