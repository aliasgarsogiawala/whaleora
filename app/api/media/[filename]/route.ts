import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dataDirectory } from '@/lib/content/store';

export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|mp4)$/.test(filename)) return new Response(null, { status: 404 });
  try {
    const data = await readFile(join(dataDirectory(), 'uploads', filename));
    const ext = filename.split('.').pop()!;
    const headers = { 'Content-Type': ({ jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4' } as Record<string, string>)[ext], 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' };
    const range = request.headers.get('range');
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${data.length}` } });
      const start = match[1] ? Number(match[1]) : Math.max(0, data.length - Number(match[2]));
      const end = match[1] && match[2] ? Math.min(Number(match[2]), data.length - 1) : data.length - 1;
      if (start > end || start >= data.length) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${data.length}` } });
      return new Response(data.subarray(start, end + 1), { status: 206, headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': String(end - start + 1) } });
    }
    return new Response(data, { headers: { ...headers, 'Content-Length': String(data.length) } });
  } catch { return new Response(null, { status: 404 }); }
}
