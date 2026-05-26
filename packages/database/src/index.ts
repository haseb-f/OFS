import { PrismaClient } from '@prisma/client';
import { createLogger } from '@ofs/logger';

const logger = createLogger('Database');

function createPrismaClient(url: string): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url } },
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });
}

// ── Primary client (PgBouncer transaction mode) ───────────────────────────────

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) throw new Error('DATABASE_URL is required');

// Singleton pattern — prevents connection pool exhaustion in serverless
const globalForPrisma = global as unknown as { _prisma?: PrismaClient };
export const db: PrismaClient =
  globalForPrisma._prisma ?? createPrismaClient(databaseUrl);

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma._prisma = db;
}

// ── Read replica client ───────────────────────────────────────────────────────

const readUrl = process.env['DATABASE_READ_URL'];

if (!readUrl) {
  logger.warn(
    {},
    'DATABASE_READ_URL is not set — read queries will fall back to the primary database'
  );
}

const globalForPrismaRead = global as unknown as { _prismaRead?: PrismaClient };
export const dbRead: PrismaClient =
  globalForPrismaRead._prismaRead ??
  createPrismaClient(readUrl ?? databaseUrl);

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrismaRead._prismaRead = dbRead;
}

// ── Health check ──────────────────────────────────────────────────────────────

export async function validateConnection(): Promise<void> {
  await db.$queryRaw`SELECT 1`;
}

export async function validateReadConnection(): Promise<'connected' | 'disconnected' | 'fallback'> {
  if (!readUrl) return 'fallback';
  try {
    await dbRead.$queryRaw`SELECT 1`;
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

// ── Re-export Prisma types ────────────────────────────────────────────────────

export type { PrismaClient };
export { Prisma } from '@prisma/client';
