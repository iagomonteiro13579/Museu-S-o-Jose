import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { digest, secretToken } from '../src/lib/security';

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const origin = process.env.APP_ORIGIN;
  if (!email || !origin)
    throw new Error('Defina INITIAL_ADMIN_EMAIL e APP_ORIGIN.');
  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    await prisma.usuario.update({
      where: { id: existing.id },
      data: { canManageUsers: true, ativo: true },
    });
    console.log('Conta existente promovida a gestora.');
    return;
  }
  const token = secretToken();
  await prisma.adminInvite.create({
    data: {
      email,
      tokenHash: digest(token),
      canManageUsers: true,
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    },
  });
  console.log(
    `Convite inicial (válido por 24 horas): ${origin}/admin/ativar#${token}`,
  );
}
main().finally(() => prisma.$disconnect());
