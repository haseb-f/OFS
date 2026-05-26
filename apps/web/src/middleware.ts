import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import createMiddleware from 'next-intl/middleware';
import { sessionOptions } from '@/lib/session';
import type { SessionData } from '@/lib/session';

const i18n = createMiddleware({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
});

// Paths inside /platform/ that require PLATFORM_OWNER session
const PLATFORM_ADMIN = [
  '/platform/dashboard',
  '/platform/brands',
  '/platform/companies',
  '/platform/branches',
  '/platform/users',
  '/platform/roles',
];

// Paths that require any authenticated brand user session
const DASHBOARD = [
  '/dashboard',
  '/sales',
  '/crm',
  '/purchases',
  '/accounting',
  '/inventory',
  '/costs',
  '/hr',
  '/reports',
  '/import',
  '/settings',
];

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + '/'));
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const locale = pathname.match(/^\/(ar|en)/)?.[1] ?? 'ar';
  const path   = pathname.replace(/^\/(ar|en)/, '') || '/';

  // Read session from encrypted cookie (Edge-compatible Web Crypto)
  const dummyRes = NextResponse.next();
  const session  = await getIronSession<SessionData>(request, dummyRes, sessionOptions);

  // ── Platform admin area ──────────────────────────────────────────────────────
  if (matchesPrefix(path, PLATFORM_ADMIN)) {
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL(`/${locale}/platform/login`, request.url));
    }
    if (session.roleCode !== 'PLATFORM_OWNER') {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // ── Brand dashboard area ─────────────────────────────────────────────────────
  if (matchesPrefix(path, DASHBOARD)) {
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    if (session.roleCode === 'PLATFORM_OWNER') {
      return NextResponse.redirect(new URL(`/${locale}/platform/dashboard`, request.url));
    }
  }

  // ── Redirect logged-in users away from auth pages ────────────────────────────
  if (session.isLoggedIn) {
    if (path === '/login' || path === '/register') {
      const dest = session.roleCode === 'PLATFORM_OWNER'
        ? `/${locale}/platform/dashboard`
        : `/${locale}/dashboard`;
      return NextResponse.redirect(new URL(dest, request.url));
    }
    if (path === '/platform/login') {
      if (session.roleCode === 'PLATFORM_OWNER') {
        return NextResponse.redirect(new URL(`/${locale}/platform/dashboard`, request.url));
      }
    }
  }

  return i18n(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
