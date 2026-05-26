import type { Role } from '@prisma/client';
import type { RoleResponse } from './dto/role.response.js';

export function toRoleResponse(role: Role): RoleResponse {
  return {
    id: role.id,
    code: role.code,
    nameAr: role.nameAr,
    nameEn: role.nameEn,
    scopeType: role.scopeType,
    isSystem: role.isSystem,
    isActive: role.isActive,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}
