import { unlink } from 'node:fs/promises';
import { safePath, uploadRoot } from './fileUtils';
import { verifyToken } from './jwt';
import { prisma } from './prisma';
import { digest } from './security';
export async function deleteLocalImage(
  imageUrl: string | null | undefined,
  token: string | null | undefined,
): Promise<{ success: boolean; error?: string }> {
  if (!token || !verifyToken(token))
    return { success: false, error: 'Token inválido' };
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: digest(token) },
  });
  if (!session || session.expiresAt <= new Date())
    return { success: false, error: 'Token expirado' };
  const user = await prisma.usuario.findUnique({
    where: { id: session.usuarioId },
  });
  if (!user?.ativo || user.role !== 'admin')
    return { success: false, error: 'Permissão insuficiente' };
  if (
    typeof imageUrl !== 'string' ||
    !/^\/api\/images\/[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(imageUrl) ||
    imageUrl.includes('..')
  )
    return {
      success: false,
      error: 'URL de imagem inválida ou arquivo original protegido',
    };
  const references = await Promise.all([
    prisma.acervo.count({
      where: { OR: [{ imagem: imageUrl }, { imagemCapa: imageUrl }] },
    }),
    prisma.acervoMidia.count({ where: { url: imageUrl } }),
    prisma.artigo.count({ where: { imagem: imageUrl } }),
    prisma.videoEspecial.count({ where: { thumbnail: imageUrl } }),
  ]);
  if (references.some(Boolean))
    return {
      success: false,
      error: 'Imagem vinculada a conteúdo; arquivo preservado.',
    };
  try {
    await unlink(safePath(uploadRoot(), imageUrl.slice('/api/images/'.length)));
    return { success: true };
  } catch {
    return { success: false, error: 'Arquivo não encontrado ou protegido.' };
  }
}
export async function deleteMultipleLocalImages(
  urls: string[],
  token: string | null | undefined,
) {
  if (urls.length > 50)
    return {
      success: false,
      deletedCount: 0,
      errors: ['Máximo de 50 imagens.'],
    };
  const results = [];
  for (const url of urls) results.push(await deleteLocalImage(url, token));
  return {
    success: results.some((r) => r.success),
    deletedCount: results.filter((r) => r.success).length,
    errors: results
      .filter((r) => !r.success)
      .map((r) => r.error || 'Falha na exclusão'),
  };
}
