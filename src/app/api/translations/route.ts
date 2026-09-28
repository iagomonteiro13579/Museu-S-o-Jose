import { normalize } from '@/lib/i18n';
import { prisma } from '@/lib/prisma';
import { digest } from '@/lib/security';
import { type NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale');
  if (locale !== 'en' && locale !== 'es') return NextResponse.json({});
  try {
    const rows = await prisma.contentTranslation.findMany({
      where: { locale, status: 'reviewed' },
    });
    const [acervo, artigos, videos, midias] = await Promise.all([
      prisma.acervo.findMany({ where: { ativo: true } }),
      prisma.artigo.findMany({ where: { ativo: true } }),
      prisma.videoEspecial.findMany({ where: { ativo: true } }),
      prisma.acervoMidia.findMany({
        where: { ativo: true, acervo: { ativo: true } },
      }),
    ]);
    const groups: Record<string, unknown[]> = {
      acervo,
      artigo: artigos,
      video: videos,
      midia: midias,
    };
    const result: Record<string, string> = {};
    for (const row of rows) {
      const original = (
        groups[row.entity] as Record<string, unknown>[] | undefined
      )?.find((x) => x.id === row.entityId)?.[row.field];
      if (typeof original === 'string' && digest(original) === row.sourceHash)
        result[normalize(original)] = row.text;
    }
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch {
    return NextResponse.json({}, { status: 503 });
  }
}
