import { z } from 'zod';

export const UpdateUserSchema = z.object({
  phone: z.string().nullable().optional(),
  nameAr: z.string().min(2).max(100).optional(),
  nameEn: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
