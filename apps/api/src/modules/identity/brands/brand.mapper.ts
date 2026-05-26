import type { Brand } from '@prisma/client';
import type { BrandResponse } from './dto/brand.response.js';

export function toBrandResponse(brand: Brand): BrandResponse {
  return {
    id: brand.id,
    nameAr: brand.nameAr,
    nameEn: brand.nameEn,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    isActive: brand.isActive,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  };
}
