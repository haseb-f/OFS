/**
 * Normalises NEXT_PUBLIC_API_URL so callers never need to worry about
 * whether the env var already includes the /v1 prefix or not.
 *
 * Both of these produce identical results:
 *   NEXT_PUBLIC_API_URL=https://ofs-api.vercel.app
 *   NEXT_PUBLIC_API_URL=https://ofs-api.vercel.app/v1
 *
 * Usage:
 *   import { apiUrl } from '@/lib/api';
 *   const endpoint = apiUrl('/auth/login');
 *   // → https://ofs-api.vercel.app/v1/auth/login
 */
function buildApiBase(): string {
  const raw = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

  // Remove trailing slashes, then strip a trailing /v1 if already present.
  const stripped = raw.replace(/\/+$/, '').replace(/\/v1$/, '');

  return `${stripped}/v1`;
}

const API_BASE = buildApiBase();

/**
 * Returns the full URL for the given API path.
 * @param path  Must start with '/', e.g. '/auth/login'
 */
export function apiUrl(path: string): string {
  // Guard against double-slashes in case caller accidentally includes a leading slash.
  const normalPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalPath}`;
}
