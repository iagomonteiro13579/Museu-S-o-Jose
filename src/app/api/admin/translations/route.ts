import { preservesTerms, protectedDefaults } from '@/lib/i18n';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { InputError, digest, positiveId, textValue } from '@/lib/security';
import { NextResponse } from 'next/server';
const fields: Record<string, string[]> = {
  acervo: [
    'titulo',
    'descricao',
    'contextoHistorico',
    'material',
    'tecnica',
    'estadoConservacao',
    'periodo',
    'formaAquisicao',
    'tags',
  ],
  artigo: ['titulo', 'resumo', 'conteudo'],
  video: ['titulo', 'descricao'],
  midia: ['titulo'],
};
async function sources() {
  const [acervo, artigo, video, midia] = await Promise.all([
    prisma.acervo.findMany({ where: { ativo: true } }),
    prisma.artigo.findMany({ where: { ativo: true } }),
    prisma.videoEspecial.findMany({ where: { ativo: true } }),
    prisma.acervoMidia.findMany({
      where: { ativo: true, acervo: { ativo: true } },
    }),
  ]);
  return { acervo, artigo, video, midia };
}
export const GET = withAuth(async () => {
  const data = await sources();
  const translations = await prisma.contentTranslation.findMany();
  const result = [];
  for (const [entity, records] of Object.entries(data))
    for (const record of records)
      for (const field of fields[entity]) {
        const source = (record as Record<string, unknown>)[field];
        if (typeof source === 'string' && source.trim())
          for (const locale of ['en', 'es']) {
            const row = translations.find(
              (t) =>
                t.entity === entity &&
                t.entityId === record.id &&
                t.field === field &&
                t.locale === locale,
            );
            result.push({
              entity,
              entityId: record.id,
              field,
              locale,
              source,
              text: row?.text || '',
              status: row
                ? row.sourceHash === digest(source)
                  ? row.status
                  : 'outdated'
                : 'pending',
            });
          }
      }
  return NextResponse.json(result);
});
export const PUT = withAuth(async (req) => {
  const body = await req.json();
  const entity = textValue(body.entity, 'Tipo', 40, true);
  const field = textValue(body.field, 'Campo', 40, true);
  const entityId = positiveId(body.entityId);
  if (
    !fields[entity]?.includes(field) ||
    !['en', 'es'].includes(body.locale) ||
    !['draft', 'reviewed'].includes(body.status)
  )
    throw new InputError('Tradução inválida.');
  const records = (await sources())[
    entity as keyof Awaited<ReturnType<typeof sources>>
  ];
  const original = (records as Record<string, unknown>[]).find(
    (r) => r.id === entityId,
  )?.[field];
  if (typeof original !== 'string')
    throw new InputError('Conteúdo não encontrado.');
  if (body.source !== original)
    throw new InputError(
      'O original mudou. Atualize a página antes de salvar.',
    );
  const text = textValue(body.text, 'Tradução', 200_000, true);
  const terms = [
    ...protectedDefaults,
    ...(await prisma.protectedTerm.findMany()).map((t) => t.term),
  ];
  if (!preservesTerms(original, text, terms))
    throw new InputError('Preserve os nomes próprios do glossário.');
  const key = { entity, entityId, field, locale: body.locale };
  const data = {
    source: original,
    sourceHash: digest(original),
    text,
    status: body.status,
  };
  await prisma.contentTranslation.upsert({
    where: { entity_entityId_field_locale: key },
    create: { ...key, ...data },
    update: data,
  });
  return NextResponse.json({ success: true });
});
