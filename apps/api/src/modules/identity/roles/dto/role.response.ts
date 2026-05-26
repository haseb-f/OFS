import type { RoleCode, ScopeType } from '@prisma/client';

export interface RoleResponse {
  id: string;
  code: RoleCode;
  nameAr: string;
  nameEn: string;
  scopeType: ScopeType;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
