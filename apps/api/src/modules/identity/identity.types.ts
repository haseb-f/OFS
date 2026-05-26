import type { RoleCode, ScopeType } from '@prisma/client';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleScopeInput {
  roleId: string;
  scopeType: ScopeType;
  brandId?: string;
  companyId?: string;
  branchId?: string;
  expiresAt?: Date;
}

export type { RoleCode, ScopeType };
