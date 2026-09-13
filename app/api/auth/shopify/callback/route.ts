import { completeCustomerLogin, siteOrigin } from '@/lib/shopify/customer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const denied = params.get('error');
  if (denied) return Response.redirect(`${siteOrigin()}/account?error=${encodeURIComponent(denied)}`, 302);

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) return Response.redirect(`${siteOrigin()}/account?error=missing-code`, 302);

  try {
    const next = await completeCustomerLogin(code, state);
    return Response.redirect(`${siteOrigin()}${next}`, 302);
  } catch (error) {
    console.error('[shopify] customer sign-in failed', error);
    return Response.redirect(`${siteOrigin()}/account?error=sign-in-failed`, 302);
  }
}
