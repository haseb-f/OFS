import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRolesRepository } from './user-roles.repository.js';
import { UsersRepository } from '../users/users.repository.js';
import { RolesRepository } from '../roles/roles.repository.js';
import { toUserRoleResponse } from './user-role.mapper.js';
import type { AssignRoleDto } from './dto/assign-role.dto.js';
import type { UserRoleResponse } from './dto/user-role.response.js';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly userRoles: UserRolesRepository,
    private readonly users: UsersRepository,
    private readonly roles: RolesRepository,
  ) {}

  async assign(userId: string, dto: AssignRoleDto): Promise<UserRoleResponse> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const role = await this.roles.findById(dto.roleId);
    if (!role) throw new NotFoundException(`Role ${dto.roleId} not found`);

    if (role.scopeType !== dto.scopeType) {
      throw new BadRequestException(
        `Role ${role.code} requires scopeType ${role.scopeType}, got ${dto.scopeType}`,
      );
    }

    const userRole = await this.userRoles.assign({
      user: { connect: { id: userId } },
      role: { connect: { id: dto.roleId } },
      scopeType: dto.scopeType,
      ...(dto.brandId ? { brand: { connect: { id: dto.brandId } } } : {}),
      ...(dto.companyId ? { company: { connect: { id: dto.companyId } } } : {}),
      ...(dto.branchId ? { branch: { connect: { id: dto.branchId } } } : {}),
      grantedBy: dto.grantedBy ?? null,
      expiresAt: dto.expiresAt ?? null,
    });

    return toUserRoleResponse(userRole);
  }

  async revoke(userId: string, userRoleId: string): Promise<void> {
    const userRole = await this.userRoles.findById(userRoleId);
    if (!userRole || userRole.userId !== userId) {
      throw new NotFoundException(`UserRole ${userRoleId} not found for user ${userId}`);
    }
    await this.userRoles.revoke(userRoleId);
  }

  async findByUser(userId: string): Promise<UserRoleResponse[]> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const userRoles = await this.userRoles.findByUser(userId);
    return userRoles.map(toUserRoleResponse);
  }
}
