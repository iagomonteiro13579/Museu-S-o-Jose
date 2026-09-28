import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { InputError, digest, emailValue, secretToken } from '@/lib/security';
import { NextResponse } from 'next/server';
export const POST = withAuth(async (req, user) => {
  if (!user.canManageUsers)
    return NextResponse.json(
      { error: 'Apenas gestores de acesso.' },
      { status: 403 },
    );
  const body = await req.json();
  const email = emailValue(body.email);
  if (await prisma.usuario.findUnique({ where: { email } }))
    throw new InputError(
      'Conta já cadastrada. Recuperações são realizadas no servidor.',
    );
  const token = secretToken();
  await prisma.$transaction([
    prisma.adminInvite.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.adminInvite.create({
      data: {
        email,
        tokenHash: digest(token),
        canManageUsers: body.canManageUsers === true,
        expiresAt: new Date(Date.now() + 24 * 3600_000),
      },
    }),
  ]);
  return NextResponse.json({
    url: `${process.env.APP_ORIGIN || req.nextUrl.origin}/admin/ativar#${token}`,
    expiresInHours: 24,
  });
});
