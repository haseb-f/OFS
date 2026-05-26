import { z } from 'zod';

export const CreateBranchSchema = z.object({
  companyId: z.string().cuid(),
  nameAr: z.string().min(2).max(100),
  nameEn: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  createdBy: z.string().cuid().optional(),
});

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
