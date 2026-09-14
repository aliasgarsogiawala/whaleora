import 'server-only';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { convexUrl } from '@/lib/convex';
import { hydrateContent, initialDocument } from './defaults';
import { validateContent, type ContentDocument, type ReviewContent } from './types';

export const dataDirectory = () => resolve(process.env.CONTENT_DATA_DIR || '.whaleora');
/**
 * Hosted deployments keep the content document in Convex, which is already the
 * database behind orders and reviews. A local dev box with no Convex URL falls
 * back to a file under CONTENT_DATA_DIR.
 */
export const usesConvex = () => Boolean(convexUrl());
const namespace = () => process.env.CONTENT_NAMESPACE || 'whaleora';

export async function readDocument(): Promise<ContentDocument> {
  let raw: string | null;
  if (usesConvex()) {
    const stored = await fetchQuery(api.content.get, { namespace: namespace() }, { url: convexUrl() });
    raw = stored?.document ?? null;
  } else {
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
  if (!usesConvex() && process.env.VERCEL) throw new Error('Connect Convex before saving on this hosted deployment.');
  const save = async () => {
    const current = await readDocument();
    if (current.revision !== revision) throw new ConflictError();
    const now = new Date().toISOString();
    const stored = hydrateContent(content);
    const next: ContentDocument = { revision: revision + 1, draft: stored, published: publish ? stored : current.published, updatedAt: now, publishedAt: publish ? now : current.publishedAt };
    if (usesConvex()) {
      const result = await fetchMutation(api.content.save, {
        namespace: namespace(),
        expectedRevision: revision,
        document: JSON.stringify(next),
        secret: process.env.ORDERS_INGEST_SECRET ?? '',
      }, { url: convexUrl() });
      if (!result.ok) throw new ConflictError();
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
