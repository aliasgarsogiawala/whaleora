import { beginCustomerLogin, customerAuthConfigured, siteOrigin } from '@/lib/shopify/customer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!customerAuthConfigured()) {
    return Response.redirect(`${siteOrigin()}/account?error=not-configured`, 302);
  }
  // Only same-site paths, so the callback cannot be turned into an open redirect.
  const asked = new URL(request.url).searchParams.get('next') ?? '';
  const next = asked.startsWith('/') && !asked.startsWith('//') ? asked : '/account';
  try {
    return Response.redirect(await beginCustomerLogin(next), 302);
  } catch (error) {
    console.error('[shopify] could not start customer sign-in', error);
    return Response.redirect(`${siteOrigin()}/account?error=sign-in-failed`, 302);
  }
}
