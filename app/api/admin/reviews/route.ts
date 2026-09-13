import { authorize, body, json } from '@/lib/admin/http';
import { convexHttp } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

/**
 * Moderation queue for customer reviews. The admin session authorises the
 * request here; the shared ingest secret authorises this server to Convex, so
 * the secret never reaches the browser.
 */
export const runtime = 'nodejs';

const secret = () => process.env.ORDERS_INGEST_SECRET || '';

export async function GET(request: Request) {
  const denied = await authorize(request, false); if (denied) return denied;
  const client = convexHttp();
  if (!client || !secret()) return json({ error: 'Reviews need Convex and ORDERS_INGEST_SECRET configured.' }, 503);
  const status = new URL(request.url).searchParams.get('status');
  const wanted = status === 'published' || status === 'removed' ? status : 'held';
  try {
    return json({ reviews: await client.query(api.reviews.queue, { secret: secret(), status: wanted }) });
  } catch {
    return json({ error: 'Could not load reviews.' }, 503);
  }
}

export async function POST(request: Request) {
  const denied = await authorize(request); if (denied) return denied;
  const client = convexHttp();
  if (!client || !secret()) return json({ error: 'Reviews need Convex and ORDERS_INGEST_SECRET configured.' }, 503);
  let data;
  try {
    data = JSON.parse((await body(request)).toString());
    if (typeof data.id !== 'string' || (data.status !== 'published' && data.status !== 'removed')) throw new Error('Invalid moderation request.');
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid request.' }, 400);
  }
  try {
    await client.mutation(api.reviews.moderate, { secret: secret(), id: data.id, status: data.status });
    return json({ ok: true });
  } catch {
    return json({ error: 'Could not update that review.' }, 503);
  }
}
