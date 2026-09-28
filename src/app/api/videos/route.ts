import { saveLocalFile } from '@/lib/fileUtils';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const videos = await prisma.videoEspecial.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: 'asc' }, { createdAt: 'desc' }],
      include: { usuario: { select: { nome: true } } },
    });
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar vídeos' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(async (request: NextRequest, user) => {
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const titulo = formData.get('titulo') as string;
    const descricao = formData.get('descricao') as string;
    const ordem = formData.get('ordem')
      ? Number(formData.get('ordem'))
      : undefined;

    if (!file || !titulo) {
      return NextResponse.json(
        { error: 'Vídeo e Título obrigatórios' },
        { status: 400 },
      );
    }

    const videoUrl = await saveLocalFile(file, 'videos');

    let novaOrdem = ordem;
    if (novaOrdem === undefined) {
      const ultimo = await prisma.videoEspecial.findFirst({
        where: { ativo: true },
        orderBy: { ordem: 'desc' },
      });
      novaOrdem = (ultimo?.ordem || 0) + 1;
    }

    const novoVideo = await prisma.videoEspecial.create({
      data: {
        titulo,
        video: videoUrl,
        descricao: descricao || '',
        tipo: 'galeria',
        ordem: novaOrdem,
        ativo: true,
        usuarioId: Number(user.userId),
      },
    });

    return NextResponse.json(novoVideo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
});
