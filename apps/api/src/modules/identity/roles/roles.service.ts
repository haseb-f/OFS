import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RolesRepository } from './roles.repository.js';
import { toRoleResponse } from './role.mapper.js';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { RoleResponse } from './dto/role.response.js';

@Injectable()
export class RolesService {
  constructor(private readonly roles: RolesRepository) {}

  async create(dto: CreateRoleDto): Promise<RoleResponse> {
    if (await this.roles.existsByCode(dto.code)) {
      throw new ConflictException(`Role ${dto.code} already exists`);
    }
    const role = await this.roles.create(dto);
    return toRoleResponse(role);
  }

  async findOne(id: string): Promise<RoleResponse> {
    const role = await this.roles.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return toRoleResponse(role);
  }

  async findAll(): Promise<RoleResponse[]> {
    const roles = await this.roles.findAll();
    return roles.map(toRoleResponse);
  }
}
