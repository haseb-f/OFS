import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import type { SessionData } from '@/lib/session';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  const session = await getIronSession<SessionData>(req, response, sessionOptions);
  session.destroy();
  return response;
}
