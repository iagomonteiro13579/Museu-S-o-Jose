import { prisma } from '@/lib/prisma';
import {
  SESSION_COOKIE,
  digest,
  sameOrigin,
  sessionCookie,
} from '@/lib/security';
import { type NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: 'Origem não autorizada.' },
      { status: 403 },
    );
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token)
    await prisma.adminSession.deleteMany({
      where: { tokenHash: digest(token) },
    });
  const response = NextResponse.json({ success: true });
  sessionCookie(response, '', 0);
  return response;
}
