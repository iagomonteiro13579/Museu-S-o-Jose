import { protectedDefaults } from '@/lib/i18n';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { textValue } from '@/lib/security';
import { NextResponse } from 'next/server';
export const GET = withAuth(async () =>
  NextResponse.json([
    ...protectedDefaults,
    ...(await prisma.protectedTerm.findMany()).map((t) => t.term),
  ]),
);
export const POST = withAuth(async (req) => {
  const term = textValue((await req.json()).term, 'Termo', 200, true);
  await prisma.protectedTerm.upsert({
    where: { term },
    create: { term },
    update: {},
  });
  return NextResponse.json({ success: true });
});
