import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { InputError } from './security';
export const uploadRoot = () =>
  path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
export function safePath(root: string, relative: string) {
  if (
    !relative ||
    relative.includes('\0') ||
    relative.includes('\\') ||
    path.isAbsolute(relative)
  )
    throw new InputError('Caminho inválido.');
  const result = path.resolve(root, relative);
  if (!result.startsWith(path.resolve(root) + path.sep))
    throw new InputError('Caminho inválido.');
  return result;
}
export async function saveLocalFile(
  file: File,
  folder: string,
): Promise<string> {
  if (
    !(file instanceof File) ||
    folder !== 'videos' ||
    file.size === 0 ||
    file.size > 100 * 1024 * 1024
  )
    throw new InputError('Envie um vídeo de até 100 MB.');
  const buffer = Buffer.from(await file.arrayBuffer());
  const mp4 = buffer.length > 12 && buffer.toString('ascii', 4, 8) === 'ftyp';
  const webm =
    buffer.length > 4 &&
    buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (!mp4 && !webm)
    throw new InputError('Formato inválido. Utilize MP4 ou WebM.');
  const name = `${randomUUID()}.${mp4 ? 'mp4' : 'webm'}`;
  const dir = safePath(uploadRoot(), folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(safePath(dir, name), buffer, { flag: 'wx' });
  return `/uploads/videos/${name}`;
}
// Soft-deleted and replaced media are retained for recovery and shared references.
export async function deleteLocalFile(_fileUrl: string) {
  return;
}
