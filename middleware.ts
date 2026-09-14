import {
  convexAuthNextjsMiddleware,
} from '@convex-dev/auth/nextjs/server';

export default convexAuthNextjsMiddleware(undefined, {
  cookieConfig: { maxAge: 60 * 60 * 24 * 30 },
  // Convex Auth otherwise claims *any* GET with a `?code=` param, tries to
  // redeem it against Convex, and on failure redirects to the same URL with
  // `code` stripped. That swallowed Shopify's OAuth callback, so customer
  // sign-in always landed on /account?error=missing-code. Nothing here needs
  // it: convex/auth.ts registers only the Password provider, which never
  // signs in through a code in the URL.
  shouldHandleCode: false,
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
