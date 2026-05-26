import type { Branch } from '@prisma/client';
import type { BranchResponse } from './dto/branch.response.js';

export function toBranchResponse(b: Branch): BranchResponse {
  return {
    id: b.id,
    companyId: b.companyId,
    nameAr: b.nameAr,
    nameEn: b.nameEn,
    address: b.address,
    phone: b.phone,
    isActive: b.isActive,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}
