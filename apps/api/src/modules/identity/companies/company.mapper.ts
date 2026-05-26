import type { Company } from '@prisma/client';
import type { CompanyResponse } from './dto/company.response.js';

export function toCompanyResponse(c: Company): CompanyResponse {
  return {
    id: c.id,
    brandId: c.brandId,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    taxNumber: c.taxNumber,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}
