import type { Permission } from '@prisma/client';
import type { PermissionResponse } from './dto/permission.response.js';

export function toPermissionResponse(p: Permission): PermissionResponse {
  return {
    id: p.id,
    resource: p.resource,
    action: p.action,
    description: p.description,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  };
}
