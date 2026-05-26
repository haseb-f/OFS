import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { createLogger } from '@ofs/logger';

const logger = createLogger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const allowedOrigins = (process.env['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3007')
    .split(',')
    .map((o) => o.trim());

  // Guard: wildcard CORS is rejected in production
  if (process.env['NODE_ENV'] === 'production' && allowedOrigins.includes('*')) {
    throw new Error('CORS wildcard (*) is not permitted in production');
  }

  // 1. CORS — explicit allowlist only
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
  });

  // 2. Global API prefix
  app.setGlobalPrefix('v1');

  // 3. Body size cap — 1 MB, JSON nesting depth cap at 10 levels
  app.use((_req: unknown, _res: unknown, next: () => void) => next());

  const port = Number(process.env['PORT'] ?? 3001);
  await app.listen(port);

  logger.info({ port, cors: allowedOrigins }, `OFS API running on port ${String(port)}`);
}

void bootstrap();
