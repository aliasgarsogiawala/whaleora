import 'server-only';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { hydrateContent, initialDocument } from './defaults';
import { validateContent, type ContentDocument, type ReviewContent } from './types';

export const dataDirectory = () => resolve(process.env.CONTENT_DATA_DIR || '.whaleora');
export const usesRedis = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const key = () => `${process.env.CONTENT_NAMESPACE || 'whaleora'}:reviews`;

export async function redis<T>(command: (string | number)[]): Promise<T> {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, { method: 'POST', headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Content storage is unavailable. Please try again.');
  const data = await response.json();
  if (data.error) throw new Error('Content storage rejected the request.');
  return data.result as T;
}

export async function readDocument(): Promise<ContentDocument> {
  let raw: string | null;
  if (usesRedis()) raw = await redis<string | null>(['GET', key()]);
  else {
    try { raw = await readFile(join(dataDirectory(), 'reviews.json'), 'utf8'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return initialDocument(); throw error; }
  }
  if (!raw) return initialDocument();
  const document = JSON.parse(raw) as ContentDocument;
  if (!Number.isInteger(document.revision) || document.revision < 0) throw new Error('Content revision is invalid.');
  return { ...document, draft: hydrateContent(validateContent(document.draft)), published: hydrateContent(validateContent(document.published)) };
}

export async function publishedContent(): Promise<ReviewContent> {
  try { return (await readDocument()).published; }
  catch { console.error('[content] Saved content unavailable; displaying the bundled review content.'); return initialDocument().published; }
}

export class ConflictError extends Error { constructor() { super('Someone saved changes in another tab. Reload the latest version before saving again.'); } }
let writeQueue: Promise<unknown> = Promise.resolve();

export async function saveDocument(content: ReviewContent, revision: number, publish: boolean): Promise<ContentDocument> {
  if (!usesRedis() && process.env.VERCEL) throw new Error('Connect durable content storage before saving on Vercel.');
  const save = async () => {
    const current = await readDocument();
    if (current.revision !== revision) throw new ConflictError();
    const now = new Date().toISOString();
    const stored = hydrateContent(content);
    const next: ContentDocument = { revision: revision + 1, draft: stored, published: publish ? stored : current.published, updatedAt: now, publishedAt: publish ? now : current.publishedAt };
    if (usesRedis()) {
      const script = "local old=redis.call('GET',KEYS[1]); local rev=0; if old then rev=cjson.decode(old).revision end; if rev~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
      if (await redis<number>(['EVAL', script, 1, key(), revision, JSON.stringify(next)]) !== 1) throw new ConflictError();
    } else {
      await mkdir(dataDirectory(), { recursive: true, mode: 0o700 });
      const temporary = join(dataDirectory(), `reviews-${randomUUID()}.tmp`);
      await writeFile(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
      await rename(temporary, join(dataDirectory(), 'reviews.json'));
    }
    return next;
  };
  const result = writeQueue.then(save, save);
  writeQueue = result.catch(() => undefined);
  return result;
}
