import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  nameAr: z.string().min(2).max(100),
  nameEn: z.string().max(100).optional(),
  passwordHash: z.string().min(60),
  createdBy: z.string().cuid().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
