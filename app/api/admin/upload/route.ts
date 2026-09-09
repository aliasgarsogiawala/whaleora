import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { authorize, body, json } from '@/lib/admin/http';
import { dataDirectory } from '@/lib/content/store';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const denied = await authorize(request); if (denied) return denied;
  if (process.env.VERCEL) return json({ error: 'Use a hosted HTTPS media URL on this deployment.' }, 400);
  try {
    const bytes = await body(request, 30 * 1024 * 1024);
    const type = request.headers.get('content-type');
    let extension = '';
    if (type === 'image/jpeg' && bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) extension = 'jpg';
    if (type === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = 'png';
    if (type === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') extension = 'webp';
    if (type === 'video/mp4' && bytes.toString('ascii', 4, 8) === 'ftyp') extension = 'mp4';
    if (!extension) return json({ error: 'Upload a JPG, PNG, WebP image or MP4 video.' }, 400);
    if (extension !== 'mp4' && bytes.length > 5 * 1024 * 1024) return json({ error: 'Images must be under 5 MB.' }, 400);
    const filename = `${randomUUID()}.${extension}`;
    await mkdir(join(dataDirectory(), 'uploads'), { recursive: true, mode: 0o700 });
    await writeFile(join(dataDirectory(), 'uploads', filename), bytes, { flag: 'wx', mode: 0o600 });
    return json({ url: `/api/media/${filename}` });
  } catch { return json({ error: 'Upload failed. Videos must be under 30 MB.' }, 400); }
}
