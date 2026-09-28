import { createHash, randomBytes } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
export const SESSION_COOKIE = 'museu_session';
export const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');
export const secretToken = () => randomBytes(32).toString('hex');
export class InputError extends Error {}
export function textValue(
  value: unknown,
  name: string,
  max = 255,
  required = false,
): string {
  if (value === undefined || value === null) {
    if (required) throw new InputError(`${name} é obrigatório.`);
    return '';
  }
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new InputError(`${name} inválido.`);
  return value.trim();
}
export function emailValue(value: unknown) {
  const email = textValue(value, 'E-mail', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new InputError('E-mail inválido.');
  return email;
}
export function passwordValue(value: unknown) {
  if (
    typeof value !== 'string' ||
    value.length < 12 ||
    Buffer.byteLength(value, 'utf8') > 72
  )
    throw new InputError(
      'Use uma senha de pelo menos 12 caracteres e no máximo 72 bytes.',
    );
  return value;
}
export function positiveId(value: unknown) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new InputError('Identificador inválido.');
  return id;
}
export function sameOrigin(request: NextRequest) {
  return (
    request.headers.get('origin') ===
    (process.env.APP_ORIGIN || request.nextUrl.origin)
  );
}
export async function rateLimit(key: string, limit: number, minutes = 15) {
  const now = Date.now();
  const windowMs = minutes * 60_000;
  const id = digest(`${key}:${Math.floor(now / windowMs)}`);
  const entry = await prisma.rateBucket.upsert({
    where: { id },
    create: { id, count: 1, expiresAt: new Date(now + windowMs) },
    update: { count: { increment: 1 } },
  });
  return entry.count <= limit;
}
export function errorResponse(error: unknown) {
  if (error instanceof InputError || error instanceof SyntaxError)
    return NextResponse.json(
      {
        error:
          error instanceof InputError ? error.message : 'Requisição inválida.',
      },
      { status: 400 },
    );
  console.error(
    'Falha na operação:',
    error instanceof Error ? error.name : 'unknown',
  );
  return NextResponse.json(
    { error: 'Não foi possível concluir a operação.' },
    { status: 500 },
  );
}
export function sessionCookie(
  response: NextResponse,
  value: string,
  maxAge = 8 * 3600,
) {
  response.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
  });
}
