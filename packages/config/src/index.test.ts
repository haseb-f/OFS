import { describe, it, expect, beforeEach } from 'vitest';
import { envSchema } from './index.js';

describe('envSchema', () => {
  it('parses valid environment variables', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://localhost/ofs',
      DIRECT_URL: 'postgresql://localhost/ofs',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      API_JWT_SECRET: 'jwt-secret',
    });
    expect(result.success).toBe(true);
  });

  it('defaults NODE_ENV to development', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost/ofs',
      DIRECT_URL: 'postgresql://localhost/ofs',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      API_JWT_SECRET: 'jwt-secret',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.NODE_ENV).toBe('development');
  });

  it('rejects invalid NODE_ENV', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'staging',
      DATABASE_URL: 'postgresql://localhost/ofs',
      DIRECT_URL: 'postgresql://localhost/ofs',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      API_JWT_SECRET: 'jwt-secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing DATABASE_URL', () => {
    const result = envSchema.safeParse({
      DIRECT_URL: 'postgresql://localhost/ofs',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      API_JWT_SECRET: 'jwt-secret',
    });
    expect(result.success).toBe(false);
  });
});
