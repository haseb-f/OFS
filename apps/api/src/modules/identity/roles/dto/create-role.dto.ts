import { z } from 'zod';
import { RoleCode, ScopeType } from '@prisma/client';

export const CreateRoleSchema = z.object({
  code: z.nativeEnum(RoleCode),
  nameAr: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100),
  scopeType: z.nativeEnum(ScopeType),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
