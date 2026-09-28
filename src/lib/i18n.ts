export const locales = ['pt', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
export const protectedDefaults = [
  'Museu Histórico de São José',
  'Museu de São José',
  'São José',
  'IFSC',
  'Rua Gaspar Neves',
  'R. Gaspar Neves',
  'Conexão Cultural',
];
export function preservesTerms(
  source: string,
  translated: string,
  terms: string[],
) {
  return terms.every(
    (term) => !source.includes(term) || translated.includes(term),
  );
}
