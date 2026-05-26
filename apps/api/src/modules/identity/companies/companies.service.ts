import { Injectable, NotFoundException } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository.js';
import { toCompanyResponse } from './company.mapper.js';
import type { CreateCompanyDto } from './dto/create-company.dto.js';
import type { CompanyResponse } from './dto/company.response.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class CompaniesService {
  constructor(private readonly companies: CompaniesRepository) {}

  async create(dto: CreateCompanyDto): Promise<CompanyResponse> {
    const company = await this.companies.create({
      brand: { connect: { id: dto.brandId } },
      nameAr: dto.nameAr,
      nameEn: dto.nameEn ?? null,
      taxNumber: dto.taxNumber ?? null,
      createdBy: dto.createdBy ?? null,
    });
    return toCompanyResponse(company);
  }

  async findOne(id: string): Promise<CompanyResponse> {
    const company = await this.companies.findById(id);
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return toCompanyResponse(company);
  }

  async findByBrand(brandId: string, params: PaginationParams): Promise<PaginatedResult<CompanyResponse>> {
    const result = await this.companies.findByBrand(brandId, params);
    return { ...result, data: result.data.map(toCompanyResponse) };
  }

  async remove(id: string): Promise<void> {
    const company = await this.companies.findById(id);
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    await this.companies.softDelete(id);
  }
}
