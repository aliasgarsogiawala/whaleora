/**
 * The hosts next/image is allowed to optimise from, and therefore the only
 * hosts a product photo may point at.
 *
 * These two things have to be decided in one place. next/image turns an
 * unlisted host into a 400 from the optimiser with nothing on the page to
 * explain it, so a studio that accepts any HTTPS URL — as the field's own hint
 * invites — quietly ships a broken image to the live site. Checking saved URLs
 * against the same list tells the editor at save time instead.
 *
 * Deliberately static, with no environment lookups: the studio validates in the
 * browser as well as on the server, and the two answers must agree.
 */
export const IMAGE_HOSTS = ['cdn.shopify.com', '**.myshopify.com'] as const;

const matchesHost = (pattern: string, hostname: string) => (pattern.startsWith('**.')
  ? hostname === pattern.slice(3) || hostname.endsWith(pattern.slice(2))
  : hostname === pattern);

/** True for a local path, or an HTTPS URL on a host the optimiser will accept. */
export function isOptimisableImage(value: string): boolean {
  if (value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && IMAGE_HOSTS.some((pattern) => matchesHost(pattern, url.hostname));
  } catch {
    return false;
  }
}

/** Human-readable host list, for the error an editor actually reads. */
export const imageHostHint = IMAGE_HOSTS.join(' or ');
