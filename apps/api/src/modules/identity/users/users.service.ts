import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { toUserResponse } from './user.mapper.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { UserResponse } from './dto/user.response.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserResponse> {
    if (await this.users.existsByEmail(dto.email)) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }
    const user = await this.users.create({
      email: dto.email,
      phone: dto.phone ?? null,
      nameAr: dto.nameAr,
      nameEn: dto.nameEn ?? null,
      passwordHash: dto.passwordHash,
      createdBy: dto.createdBy ?? null,
    });
    return toUserResponse(user);
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return toUserResponse(user);
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<UserResponse>> {
    const result = await this.users.findMany(params);
    return { ...result, data: result.data.map(toUserResponse) };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} not found`);

    const user = await this.users.update(id, {
      ...(dto.phone !== undefined ? { phone: dto.phone ?? null } : {}),
      ...(dto.nameAr !== undefined ? { nameAr: dto.nameAr } : {}),
      ...(dto.nameEn !== undefined ? { nameEn: dto.nameEn ?? null } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.isVerified !== undefined ? { isVerified: dto.isVerified } : {}),
    });
    return toUserResponse(user);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    await this.users.softDelete(id);
  }
}
