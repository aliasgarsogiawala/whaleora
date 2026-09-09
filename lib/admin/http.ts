import { checkOrigin, isAdmin } from './auth';

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function authorize(request: Request, mutation = true) {
  if (mutation) { try { checkOrigin(request); } catch { return json({ error: 'Request origin was rejected.' }, 403); } }
  if (!await isAdmin()) return json({ error: 'Please sign in again.' }, 401);
  return null;
}

export async function body(request: Request, limit = 200_000) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Request body is missing.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Error('Request is too large.'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
