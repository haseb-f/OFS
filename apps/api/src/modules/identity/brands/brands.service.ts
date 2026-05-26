import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BrandsRepository } from './brands.repository.js';
import { toBrandResponse } from './brand.mapper.js';
import type { CreateBrandDto } from './dto/create-brand.dto.js';
import type { BrandResponse } from './dto/brand.response.js';
import type { PaginationParams, PaginatedResult } from '../identity.types.js';

@Injectable()
export class BrandsService {
  constructor(private readonly brands: BrandsRepository) {}

  async create(dto: CreateBrandDto): Promise<BrandResponse> {
    if (await this.brands.existsBySlug(dto.slug)) {
      throw new ConflictException(`Brand slug "${dto.slug}" is already taken`);
    }
    const brand = await this.brands.create({
      nameAr: dto.nameAr,
      nameEn: dto.nameEn ?? null,
      slug: dto.slug,
      logoUrl: dto.logoUrl ?? null,
      createdBy: dto.createdBy ?? null,
    });
    return toBrandResponse(brand);
  }

  async findOne(id: string): Promise<BrandResponse> {
    const brand = await this.brands.findById(id);
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    return toBrandResponse(brand);
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<BrandResponse>> {
    const result = await this.brands.findMany(params);
    return { ...result, data: result.data.map(toBrandResponse) };
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brands.findById(id);
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    await this.brands.softDelete(id);
  }
}
