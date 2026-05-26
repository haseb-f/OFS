import type { ScopeType } from '@prisma/client';

export interface UserRoleResponse {
  id: string;
  userId: string;
  roleId: string;
  scopeType: ScopeType;
  brandId: string | null;
  companyId: string | null;
  branchId: string | null;
  isActive: boolean;
  grantedBy: string | null;
  grantedAt: string;
  expiresAt: string | null;
}
