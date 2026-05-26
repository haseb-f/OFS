import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchesRepository } from './branches.repository.js';
import { toBranchResponse } from './branch.mapper.js';
import type { CreateBranchDto } from './dto/create-branch.dto.js';
import type { BranchResponse } from './dto/branch.response.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class BranchesService {
  constructor(private readonly branches: BranchesRepository) {}

  async create(dto: CreateBranchDto): Promise<BranchResponse> {
    const branch = await this.branches.create({
      company: { connect: { id: dto.companyId } },
      nameAr: dto.nameAr,
      nameEn: dto.nameEn ?? null,
      address: dto.address ?? null,
      phone: dto.phone ?? null,
      createdBy: dto.createdBy ?? null,
    });
    return toBranchResponse(branch);
  }

  async findOne(id: string): Promise<BranchResponse> {
    const branch = await this.branches.findById(id);
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    return toBranchResponse(branch);
  }

  async findByCompany(companyId: string, params: PaginationParams): Promise<PaginatedResult<BranchResponse>> {
    const result = await this.branches.findByCompany(companyId, params);
    return { ...result, data: result.data.map(toBranchResponse) };
  }

  async remove(id: string): Promise<void> {
    const branch = await this.branches.findById(id);
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    await this.branches.softDelete(id);
  }
}
