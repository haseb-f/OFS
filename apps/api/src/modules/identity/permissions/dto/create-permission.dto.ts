import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  resource: z.string().min(2).max(64).regex(/^[a-z_]+$/),
  action: z.string().min(2).max(64).regex(/^[a-z_]+$/),
  description: z.string().max(255).optional(),
});

export type CreatePermissionDto = z.infer<typeof CreatePermissionSchema>;
