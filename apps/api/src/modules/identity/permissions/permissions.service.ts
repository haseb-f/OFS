import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository.js';
import { toPermissionResponse } from './permission.mapper.js';
import type { CreatePermissionDto } from './dto/create-permission.dto.js';
import type { PermissionResponse } from './dto/permission.response.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissions: PermissionsRepository) {}

  async create(dto: CreatePermissionDto): Promise<PermissionResponse> {
    if (await this.permissions.existsByResourceAction(dto.resource, dto.action)) {
      throw new ConflictException(`Permission ${dto.resource}:${dto.action} already exists`);
    }
    const permission = await this.permissions.create({
      resource: dto.resource,
      action: dto.action,
      description: dto.description ?? null,
    });
    return toPermissionResponse(permission);
  }

  async findAll(resource?: string): Promise<PermissionResponse[]> {
    const permissions = await this.permissions.findAll(resource);
    return permissions.map(toPermissionResponse);
  }

  async findOne(id: string): Promise<PermissionResponse> {
    const permission = await this.permissions.findById(id);
    if (!permission) throw new NotFoundException(`Permission ${id} not found`);
    return toPermissionResponse(permission);
  }

  async assignToRole(
    roleId: string,
    permissionId: string,
    grantedBy?: string,
  ): Promise<void> {
    const permission = await this.permissions.findById(permissionId);
    if (!permission) throw new NotFoundException(`Permission ${permissionId} not found`);
    await this.permissions.assignToRole(roleId, permissionId, grantedBy);
  }

  async revokeFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.permissions.revokeFromRole(roleId, permissionId);
  }

  async findByRole(roleId: string): Promise<PermissionResponse[]> {
    const permissions = await this.permissions.findByRole(roleId);
    return permissions.map(toPermissionResponse);
  }
}
