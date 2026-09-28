import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { InputError, positiveId } from '@/lib/security';
import { NextResponse } from 'next/server';
export const GET = withAuth(async (_req, user) => {
  if (!user.canManageUsers)
    return NextResponse.json(
      { error: 'Apenas gestores de acesso.' },
      { status: 403 },
    );
  const users = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      ativo: true,
      canManageUsers: true,
    },
    orderBy: { nome: 'asc' },
  });
  return NextResponse.json(users);
});
export const PATCH = withAuth(async (req, user) => {
  if (!user.canManageUsers)
    return NextResponse.json(
      { error: 'Apenas gestores de acesso.' },
      { status: 403 },
    );
  const body = await req.json();
  const id = positiveId(body.id);
  if (typeof body.ativo !== 'boolean') throw new InputError('Estado inválido.');
  if (id === Number(user.userId))
    throw new InputError('Não é possível desativar sua própria conta.');
  // Managers cannot be disabled through this endpoint; recovery remains available on the server.
  const target = await prisma.usuario.findUnique({ where: { id } });
  if (!target || target.canManageUsers)
    throw new InputError(
      'Gestores são protegidos. Use o procedimento controlado de recuperação.',
    );
  await prisma.$transaction([
    prisma.usuario.update({ where: { id }, data: { ativo: body.ativo } }),
    prisma.adminSession.deleteMany({ where: { usuarioId: id } }),
  ]);
  return NextResponse.json({ success: true });
});
