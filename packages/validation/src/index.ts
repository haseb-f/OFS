import { z } from 'zod';
import { DATE_DISPLAY_REGEX } from '@ofs/utils';

// ── Date primitive ────────────────────────────────────────────────────────────

/** Accepts only DD MMM YYYY strings (e.g. "01 Jan 2026"). */
export const datePrimitive = z
  .string()
  .regex(DATE_DISPLAY_REGEX, {
    message: 'يجب أن يكون التاريخ بتنسيق DD MMM YYYY | Date must be in DD MMM YYYY format',
  });

// ── Money primitive ───────────────────────────────────────────────────────────

/** Accepts a BigInt-compatible string representing minor units. */
export const moneyPrimitive = z
  .string()
  .regex(/^\d+$/, {
    message: 'يجب أن تكون القيمة المالية عدداً صحيحاً موجباً | Amount must be a positive integer string',
  })
  .transform((val) => BigInt(val));

// ── Pagination schemas ────────────────────────────────────────────────────────

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const offsetPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ── Workflow transition schema factory ────────────────────────────────────────

export function workflowTransitionSchema<TStatus extends string>(statuses: [TStatus, ...TStatus[]]) {
  return z.object({
    targetStatus: z.enum(statuses),
    reason: z.string().optional(),
  });
}

// ── Custom field schema factory ───────────────────────────────────────────────

export const customFieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const customFieldSchema = z.record(z.string(), customFieldValueSchema);

// ── Arabic-first Zod error map ────────────────────────────────────────────────

export function setArabicFirstErrorMap() {
  z.setErrorMap((issue, ctx) => {
    switch (issue.code) {
      case z.ZodIssueCode.too_small:
        return { message: `القيمة صغيرة جداً | ${ctx.defaultError}` };
      case z.ZodIssueCode.too_big:
        return { message: `القيمة كبيرة جداً | ${ctx.defaultError}` };
      case z.ZodIssueCode.invalid_type:
        return { message: `نوع البيانات غير صحيح | ${ctx.defaultError}` };
      case z.ZodIssueCode.invalid_string:
        return { message: `النص غير صالح | ${ctx.defaultError}` };
      default:
        return { message: ctx.defaultError };
    }
  });
}

// ── Re-exports ────────────────────────────────────────────────────────────────

export { z };
export type { ZodSchema, ZodType, infer as ZodInfer } from 'zod';
