import { z } from 'zod';
import { cursorPaginationSchema, offsetPaginationSchema, datePrimitive } from '@ofs/validation';

// ── ApiResponse envelope schemas ──────────────────────────────────────────────

export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    requestId: z.string(),
  });

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    messageAr: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
  requestId: z.string(),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.discriminatedUnion('success', [apiSuccessSchema(dataSchema), apiErrorSchema]);

// ── Pagination ────────────────────────────────────────────────────────────────

export { cursorPaginationSchema, offsetPaginationSchema };

export const cursorPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  });

export const offsetPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

// ── Auth DTOs ─────────────────────────────────────────────────────────────────

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    tenantId: z.string(),
    permissions: z.array(z.string()),
  }),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

// ── Tenant DTOs ───────────────────────────────────────────────────────────────

export const createTenantRequestSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  subdomain: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'Subdomain must be lowercase alphanumeric with hyphens'),
});
export type CreateTenantRequest = z.infer<typeof createTenantRequestSchema>;

export const tenantResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string(),
  subdomain: z.string(),
  isActive: z.boolean(),
  createdAt: datePrimitive,
});
export type TenantResponse = z.infer<typeof tenantResponseSchema>;

// ── User DTOs ─────────────────────────────────────────────────────────────────

export const inviteUserRequestSchema = z.object({
  email: z.string().email(),
  permissions: z.array(z.string()).min(1),
});
export type InviteUserRequest = z.infer<typeof inviteUserRequestSchema>;

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  tenantId: z.string(),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: datePrimitive,
});
export type UserResponse = z.infer<typeof userResponseSchema>;

// ── Webhook payload types ─────────────────────────────────────────────────────

export const tenantCreatedWebhookSchema = z.object({
  event: z.literal('tenant.created'),
  tenantId: z.string(),
  name: z.string(),
  timestamp: datePrimitive,
});
export type TenantCreatedWebhook = z.infer<typeof tenantCreatedWebhookSchema>;

export const userInvitedWebhookSchema = z.object({
  event: z.literal('user.invited'),
  tenantId: z.string(),
  userId: z.string(),
  email: z.string(),
  timestamp: datePrimitive,
});
export type UserInvitedWebhook = z.infer<typeof userInvitedWebhookSchema>;
