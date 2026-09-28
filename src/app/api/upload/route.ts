import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { safePath, uploadRoot } from '@/lib/fileUtils';
import { withAuth } from '@/lib/middleware';
import { InputError } from '@/lib/security';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
export const POST = withAuth(async (request) => {
  const data = await request.formData();
  const file = data.get('file');
  if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024)
    throw new InputError('Envie uma imagem de até 5 MB.');
  const input = Buffer.from(await file.arrayBuffer());
  let buffer: Buffer;
  try {
    buffer = await sharp(input, {
      limitInputPixels: 40_000_000,
      animated: false,
    })
      .rotate()
      .webp({ quality: 88 })
      .toBuffer();
  } catch {
    throw new InputError('Imagem inválida. Use JPG, PNG, GIF ou WebP.');
  }
  const fileName = `${randomUUID()}.webp`;
  await mkdir(uploadRoot(), { recursive: true });
  await writeFile(safePath(uploadRoot(), fileName), buffer, { flag: 'wx' });
  return NextResponse.json({
    success: true,
    url: `/api/images/${fileName}`,
    fileName,
  });
});
