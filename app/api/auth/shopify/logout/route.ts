import { clearCustomerSession, customerLogoutUrl, siteOrigin } from '@/lib/shopify/customer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST so a prefetch or an image tag cannot sign someone out. */
export async function POST() {
  try {
    const url = await customerLogoutUrl();
    await clearCustomerSession();
    return Response.json({ ok: true, logoutUrl: url });
  } catch {
    await clearCustomerSession();
    return Response.json({ ok: true, logoutUrl: siteOrigin() });
  }
}
