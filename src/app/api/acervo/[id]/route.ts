import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const acervo = await prisma.acervo.findUnique({
      where: {
        id: Number.parseInt((await params).id),
        ativo: true,
      },
    });

    if (!acervo) {
      return NextResponse.json(
        { error: 'Item do acervo não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(acervo);
  } catch (error) {
    console.error('Erro ao buscar item do acervo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export const PUT = withAuth(
  async (
    request: NextRequest,
    user,
    context: { params: Promise<{ id: string }> },
    token?: string,
  ) => {
    try {
      const { titulo, descricao, imagem, colecao, midias } =
        await request.json();

      const acervo = await prisma.$transaction(async (tx) => {
        const acervo = await tx.acervo.update({
          where: {
            id: Number.parseInt((await context?.params)?.id ?? ''),
          },
          data: {
            titulo,
            descricao,
            imagem,
            colecao,
          },
        });

        if (midias && Array.isArray(midias)) {
          await tx.acervoMidia.updateMany({
            where: {
              acervoId: acervo.id,
            },
            data: {
              ativo: false,
            },
          });

          if (midias.length > 0) {
            await tx.acervoMidia.createMany({
              data: midias.map(
                (midia: {
                  tipo: string;
                  url: string;
                  titulo?: string;
                  ordem?: number;
                }) => ({
                  acervoId: acervo.id,
                  tipo: midia.tipo,
                  url: midia.url,
                  titulo: midia.titulo || '',
                  ordem: midia.ordem || 0,
                  ativo: true,
                }),
              ),
            });
          }
        }

        return acervo;
      });
      return NextResponse.json(acervo);
    } catch (error) {
      console.error('Erro ao atualizar item do acervo:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withAuth(
  async (
    request: NextRequest,
    user,
    context: { params: Promise<{ id: string }> },
    token?: string,
  ) => {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!(await context?.params)?.id) {
      return NextResponse.json(
        { error: 'ID do item é obrigatório' },
        { status: 400 },
      );
    }

    try {
      const acervo = await prisma.acervo.findUnique({
        where: {
          id: Number.parseInt((await context?.params)?.id ?? ''),
        },
        select: {
          imagem: true,
        },
      });

      if (!acervo) {
        return NextResponse.json(
          { error: 'Item do acervo não encontrado' },
          { status: 404 },
        );
      }

      // Retain media for recovery and existing references.

      await prisma.acervo.update({
        where: {
          id: Number.parseInt((await context?.params)?.id ?? ''),
        },
        data: {
          ativo: false,
        },
      });

      return NextResponse.json({
        message: 'Item do acervo deletado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar item do acervo:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 },
      );
    }
  },
);
