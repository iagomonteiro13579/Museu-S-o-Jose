import { generateToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import {
  digest,
  emailValue,
  errorResponse,
  rateLimit,
  sessionCookie,
} from '@/lib/security';
import bcrypt from 'bcryptjs';
import { type NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail, senha } = await request.json();
    const email = emailValue(rawEmail);
    if (
      !(await rateLimit(`login:${email}`, 8)) ||
      !(await rateLimit('login:global', 120))
    )
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 },
      );
    const account = await prisma.usuario.findUnique({ where: { email } });
    const valid =
      typeof senha === 'string' &&
      Buffer.byteLength(senha) <= 72 &&
      (await bcrypt.compare(
        senha,
        account?.senhaHash ||
          '$2b$12$YQ8oELmQV0Iz45ByPPYkN.JR8VzG3krIkMNmxibHJmRTLVpy25wie',
      ));
    if (!valid || !account?.ativo || account.role !== 'admin')
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 },
      );
    const token = generateToken({
      userId: String(account.id),
      email: account.email,
      role: account.role,
    });
    await prisma.adminSession.create({
      data: {
        tokenHash: digest(token),
        usuarioId: account.id,
        expiresAt: new Date(Date.now() + 8 * 3600_000),
      },
    });
    const response = NextResponse.json(
      {
        token,
        user: {
          id: account.id,
          nome: account.nome,
          email: account.email,
          role: account.role,
          canManageUsers: account.canManageUsers,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
    sessionCookie(response, token);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
