import type { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
  roleCode?: string;
  brandId?: string | null;
  isLoggedIn?: boolean;
  rememberMe?: boolean;
}

const SESSION_SECRET = process.env['SESSION_SECRET'] ?? 'ofs-dev-secret-32-chars-minimum!!';

export const sessionOptions: SessionOptions = {
  password: SESSION_SECRET,
  cookieName: 'ofs_session',
  cookieOptions: {
    secure: process.env['NODE_ENV'] === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export const REMEMBER_ME_TTL = 60 * 60 * 24 * 30; // 30 days in seconds
export const SESSION_TTL     = 60 * 60 * 8;         // 8 hours (single session)
