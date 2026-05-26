import type { AuditEvent } from '@ofs/types';
import { createLogger } from '@ofs/logger';

const logger = createLogger('AuditEmitter');

const PII_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'creditCard',
  'cardNumber',
  'cvv',
]);

/** Fields excluded from audit diffs — they change on every mutation */
const EXCLUDED_FROM_DIFF = new Set(['updatedAt', 'updated_at']);

export type PrismaTransaction = {
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

/**
 * Computes a diff between before and after objects.
 * Returns only changed fields; excludes updatedAt and PII.
 * BigInt values are serialized as strings.
 */
export function computeDiff(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): { before: Record<string, unknown> | null; after: Record<string, unknown> | null } {
  if (!before || !after) return { before, after };

  const changedBefore: Record<string, unknown> = {};
  const changedAfter: Record<string, unknown> = {};

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    if (EXCLUDED_FROM_DIFF.has(key)) continue;

    const bVal = before[key];
    const aVal = after[key];

    if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
      changedBefore[key] = PII_FIELDS.has(key) ? '[REDACTED]' : serializeValue(bVal);
      changedAfter[key] = PII_FIELDS.has(key) ? '[REDACTED]' : serializeValue(aVal);
    }
  }

  return { before: changedBefore, after: changedAfter };
}

function serializeValue(val: unknown): unknown {
  if (typeof val === 'bigint') return val.toString();
  if (Array.isArray(val)) return val.map(serializeValue);
  if (val && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, serializeValue(v)])
    );
  }
  return val;
}

export class AuditEmitter {
  /**
   * Writes an AuditLog row inside the caller's transaction.
   * The tx parameter is NOT optional — audit must be atomic with the mutation.
   */
  async emit(event: AuditEvent, tx: PrismaTransaction): Promise<void> {
    try {
      await tx.auditLog.create({
        data: {
          tenantId: event.tenantId,
          actorId: event.actorId,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          before: event.before ?? undefined,
          after: event.after ?? undefined,
          requestId: event.requestId,
          ipAddress: event.ipAddress ?? null,
          createdAt: new Date(),
        },
      });
    } catch (err) {
      logger.error({ err, event: { ...event, before: '[omitted]', after: '[omitted]' } }, 'AuditEmitter.emit failed');
      throw err;
    }
  }
}

export type { AuditEvent };
