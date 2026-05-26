import { z } from 'zod';

export const CreateBrandSchema = z.object({
  nameAr: z.string().min(2).max(100),
  nameEn: z.string().max(100).optional(),
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional(),
  createdBy: z.string().cuid().optional(),
});

export type CreateBrandDto = z.infer<typeof CreateBrandSchema>;
