import { createHmac, randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { digest } from '@/lib/security';
import { type NextRequest, NextResponse } from 'next/server';
const day = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(),
  );
const signed = (id: string) =>
  `${id}.${createHmac('sha256', process.env.JWT_SECRET || '')
    .update(id)
    .digest('hex')}`;
export async function GET() {
  try {
    return NextResponse.json(
      {
        count:
          (await prisma.visitorDay.findUnique({ where: { day: day() } }))
            ?.count || 0,
        period: 'day',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { error: 'Contador indisponível' },
      { status: 503 },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const today = day();
    const cookie = req.cookies.get('museu_visitor')?.value;
    const valid =
      !!cookie &&
      /^[\w-]+\.[a-f0-9]{64}$/.test(cookie) &&
      signed(cookie.split('.')[0]) === cookie;
    const visitor = valid ? cookie?.split('.')[0] : randomUUID();
    const id = digest(`${today}:${visitor}`);
    const result = await prisma.$transaction(async (tx) => {
      const receipt = await tx.visitorReceipt.createMany({
        data: [{ id, day: today }],
        skipDuplicates: true,
      });
      const row = await tx.visitorDay.upsert({
        where: { day: today },
        create: { day: today, count: receipt.count },
        update: { count: { increment: receipt.count } },
      });
      return { count: row.count, counted: receipt.count === 1, period: 'day' };
    });
    const response = NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
    response.cookies.set('museu_visitor', signed(visitor), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 86400,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Contador indisponível' },
      { status: 503 },
    );
  }
}
