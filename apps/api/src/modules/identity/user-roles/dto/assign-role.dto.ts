import { z } from 'zod';
import { ScopeType } from '@prisma/client';

export const AssignRoleSchema = z.object({
  roleId: z.string().cuid(),
  scopeType: z.nativeEnum(ScopeType),
  brandId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  branchId: z.string().cuid().optional(),
  grantedBy: z.string().cuid().optional(),
  expiresAt: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
}).refine(
  (d) => {
    if (d.scopeType === ScopeType.GLOBAL) return true;
    if (d.scopeType === ScopeType.BRAND) return !!d.brandId;
    if (d.scopeType === ScopeType.COMPANY) return !!d.brandId && !!d.companyId;
    if (d.scopeType === ScopeType.BRANCH) return !!d.brandId && !!d.companyId && !!d.branchId;
    return false;
  },
  { message: 'Scope fields must match scopeType' },
);

export type AssignRoleDto = z.infer<typeof AssignRoleSchema>;
