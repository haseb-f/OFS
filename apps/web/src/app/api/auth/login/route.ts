import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, REMEMBER_ME_TTL, SESSION_TTL } from '@/lib/session';
import type { SessionData } from '@/lib/session';
import { apiUrl } from '@/lib/api';

const TAG = '[/api/auth/login]';

interface LoginBody {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ApiLoginResponse {
  userId: string;
  email: string;
  name: string;
  roleCode: string;
  brandId: string | null;
}

function extractMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const b = body as Record<string, unknown>;
  const msg = b['message'];
  if (Array.isArray(msg)) return String(msg[0] ?? '');
  if (typeof msg === 'string') return msg;
  return '';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: LoginBody | null = null;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    console.error(`${TAG} Failed to parse request body`);
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  console.log(`${TAG} POST — email: ${body.email}`);

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
  }

  const endpoint = apiUrl('/auth/login');
  console.log(`${TAG} Calling NestJS: ${endpoint}`);

  let apiRes: Response | null = null;
  try {
    apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch (err) {
    console.error(`${TAG} Network error reaching NestJS API:`, err);
    return NextResponse.json(
      { error: 'تعذّر الاتصال بالخادم' },
      { status: 503 },
    );
  }

  console.log(`${TAG} NestJS responded with status: ${apiRes.status}`);

  if (!apiRes.ok) {
    let errBody: unknown = {};
    try { errBody = await apiRes.json(); } catch { /* non-JSON body */ }
    const msg = extractMessage(errBody);
    console.warn(`${TAG} Auth failed — status: ${apiRes.status} | message: ${msg || '(empty)'} | raw:`, errBody);
    return NextResponse.json(
      { error: msg || 'بريد إلكتروني أو كلمة مرور غير صحيحة' },
      { status: 401 },
    );
  }

  const data = (await apiRes.json()) as ApiLoginResponse;
  console.log(`${TAG} Auth success — userId: ${data.userId} | role: ${data.roleCode} | brandId: ${data.brandId ?? 'null'}`);

  const response = NextResponse.json({ success: true });
  const ttl = body.rememberMe ? REMEMBER_ME_TTL : SESSION_TTL;
  const opts = { ...sessionOptions, cookieOptions: { ...sessionOptions.cookieOptions, maxAge: ttl } };

  const session = await getIronSession<SessionData>(req, response, opts);
  session.userId     = data.userId;
  session.email      = data.email;
  session.name       = data.name;
  session.roleCode   = data.roleCode;
  session.brandId    = data.brandId ?? null;
  session.isLoggedIn = true;
  session.rememberMe = !!body.rememberMe;
  await session.save();

  console.log(`${TAG} Session saved — userId: ${data.userId} | ttl: ${ttl}s | rememberMe: ${!!body.rememberMe}`);
  return response;
}
