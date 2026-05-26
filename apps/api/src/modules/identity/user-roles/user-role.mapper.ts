import type { UserRole } from '@prisma/client';
import type { UserRoleResponse } from './dto/user-role.response.js';

export function toUserRoleResponse(ur: UserRole): UserRoleResponse {
  return {
    id: ur.id,
    userId: ur.userId,
    roleId: ur.roleId,
    scopeType: ur.scopeType,
    brandId: ur.brandId,
    companyId: ur.companyId,
    branchId: ur.branchId,
    isActive: ur.isActive,
    grantedBy: ur.grantedBy,
    grantedAt: ur.grantedAt.toISOString(),
    expiresAt: ur.expiresAt?.toISOString() ?? null,
  };
}
