import { NextResponse } from 'next/server';
import { formatDate } from '@ofs/utils';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'web',
    timestamp: formatDate(new Date(), 'en'),
  });
}
