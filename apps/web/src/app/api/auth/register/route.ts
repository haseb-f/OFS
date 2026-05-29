import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(apiUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: 'تعذّر الاتصال بالخادم' }, { status: 503 });
  }

  const data = (await apiRes.json().catch(() => ({}))) as { message?: string };

  if (!apiRes.ok) {
    return NextResponse.json({ error: data.message ?? 'حدث خطأ أثناء التسجيل' }, { status: apiRes.status });
  }

  return NextResponse.json(data, { status: 201 });
}
