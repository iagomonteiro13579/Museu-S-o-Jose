import { prisma } from '@/lib/prisma';
import {
  InputError,
  digest,
  emailValue,
  errorResponse,
  passwordValue,
  rateLimit,
  textValue,
} from '@/lib/security';
import bcrypt from 'bcryptjs';
import { type NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = textValue(body.token, 'Convite', 128, true);
    if (!(await rateLimit(`invite:${digest(token)}`, 8)))
      return NextResponse.json(
        { error: 'Aguarde antes de tentar novamente.' },
        { status: 429 },
      );
    const email = emailValue(body.email);
    const nome = textValue(body.nome, 'Nome', 120, true);
    const senhaHash = await bcrypt.hash(passwordValue(body.senha), 12);
    await prisma.$transaction(async (tx) => {
      const invite = await tx.adminInvite.findUnique({
        where: { tokenHash: digest(token) },
      });
      if (
        !invite ||
        invite.usedAt ||
        invite.expiresAt <= new Date() ||
        invite.email !== email
      )
        throw new InputError('Convite inválido ou expirado.');
      const claimed = await tx.adminInvite.updateMany({
        where: { id: invite.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) throw new InputError('Convite já utilizado.');
      const existing = await tx.usuario.findUnique({ where: { email } });
      if (existing && !invite.recovery)
        throw new InputError('Esta conta já existe.');
      const account = existing
        ? await tx.usuario.update({
            where: { id: existing.id },
            data: { senhaHash, ativo: true },
          })
        : await tx.usuario.create({
            data: {
              nome,
              email,
              senhaHash,
              role: 'admin',
              canManageUsers: invite.canManageUsers,
            },
          });
      await tx.adminSession.deleteMany({ where: { usuarioId: account.id } });
      await tx.auditEvent.create({
        data: { usuarioId: account.id, action: 'CONVITE_ACEITO' },
      });
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
