import { deleteLocalFile, saveLocalFile } from '@/lib/fileUtils';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export const PUT = withAuth(
  async (
    request: NextRequest,
    user,
    context: { params: Promise<{ id: string }> },
  ) => {
    if (user.role !== 'admin')
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

    try {
      const formData = await request.formData();
      const id = Number((await context?.params)?.id);
      const file = formData.get('video') as File | null;
      const titulo = formData.get('titulo') as string;
      const descricao = formData.get('descricao') as string;

      const videoAtual = await prisma.videoEspecial.findUnique({
        where: { id },
      });
      if (!videoAtual)
        return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

      let videoUrl = videoAtual.video;

      if (file && file.size > 0) {
        // Preserve the previous file until recovery is no longer needed.
        videoUrl = await saveLocalFile(file, 'videos');
      }

      const atualizado = await prisma.videoEspecial.update({
        where: { id },
        data: { titulo, video: videoUrl, descricao },
      });

      return NextResponse.json(atualizado);
    } catch (error) {
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }
  },
);

export const DELETE = withAuth(
  async (
    request: NextRequest,
    user,
    context: { params: Promise<{ id: string }> },
  ) => {
    if (user.role !== 'admin')
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

    try {
      const id = Number((await context?.params)?.id);

      const video = await prisma.videoEspecial.findUnique({ where: { id } });
      if (video) await deleteLocalFile(video.video);

      await prisma.videoEspecial.update({
        where: { id },
        data: { ativo: false },
      });

      return NextResponse.json({ message: 'Deletado' });
    } catch (error) {
      return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
    }
  },
);
