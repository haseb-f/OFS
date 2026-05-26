import { z } from 'zod';

export const CreateCompanySchema = z.object({
  brandId: z.string().cuid(),
  nameAr: z.string().min(2).max(100),
  nameEn: z.string().max(100).optional(),
  taxNumber: z.string().max(20).optional(),
  createdBy: z.string().cuid().optional(),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
