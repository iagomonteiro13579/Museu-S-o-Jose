import { type NextRequest, NextResponse } from 'next/server';
import { type JWTPayload, getTokenFromHeader, verifyToken } from './jwt';
import { prisma } from './prisma';
import { SESSION_COOKIE, digest, errorResponse, sameOrigin } from './security';
export function withAuth<
  T extends object = { params: Promise<Record<string, string>> },
>(
  handler: (
    req: NextRequest,
    user: JWTPayload,
    context: T,
    token?: string,
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: T) => {
    try {
      const cookie = req.cookies.get(SESSION_COOKIE)?.value;
      const token =
        cookie || getTokenFromHeader(req.headers.get('Authorization'));
      if (!token)
        return NextResponse.json(
          { error: 'Autenticação necessária.' },
          { status: 401 },
        );
      if (
        cookie &&
        !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
        !sameOrigin(req)
      )
        return NextResponse.json(
          { error: 'Origem não autorizada.' },
          { status: 403 },
        );
      const payload = verifyToken(token);
      if (!payload)
        return NextResponse.json(
          { error: 'Sessão inválida ou expirada.' },
          { status: 401 },
        );
      const session = await prisma.adminSession.findUnique({
        where: { tokenHash: digest(token) },
      });
      if (
        !session ||
        session.expiresAt <= new Date() ||
        session.usuarioId !== Number(payload.userId)
      )
        return NextResponse.json(
          { error: 'Sessão encerrada.' },
          { status: 401 },
        );
      const account = await prisma.usuario.findUnique({
        where: { id: session.usuarioId },
      });
      if (!account?.ativo || account.role !== 'admin')
        return NextResponse.json(
          { error: 'Acesso indisponível.' },
          { status: 403 },
        );
      const user = {
        ...payload,
        role: account.role,
        canManageUsers: account.canManageUsers,
      };
      const response = await handler(req, user, context, token);
      response.headers.set('Cache-Control', 'no-store');
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && response.ok)
        await prisma.auditEvent
          .create({
            data: {
              usuarioId: account.id,
              action: `${req.method} ${req.nextUrl.pathname}`,
            },
          })
          .catch(() => console.error('Falha ao registrar auditoria.'));
      return response;
    } catch (error) {
      return errorResponse(error);
    }
  };
}
export function requireRole(role: string) {
  return <T extends object = { params: Promise<Record<string, string>> }>(
    handler: (
      req: NextRequest,
      user: JWTPayload,
      context: T,
      token?: string,
    ) => Promise<NextResponse>,
  ) =>
    withAuth<T>(async (req, user, context, token) => {
      if (user.role !== role)
        return NextResponse.json(
          { error: 'Permissão insuficiente.' },
          { status: 403 },
        );
      return handler(req, user, context, token);
    });
}
