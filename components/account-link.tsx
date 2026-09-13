'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

/**
 * Reads a marker cookie rather than the session itself — the session cookie is
 * httpOnly and must stay that way. The marker holds no token, only whether one
 * exists, so the worst case is a stale label until the next page load.
 */
const readMarker = () => document.cookie.split('; ').some((entry) => entry.startsWith('whaleora_signed_in='));

/** The cookie changes only on navigation, which remounts this anyway. */
const subscribe = () => () => {};

export function AccountLink({ className = 'contact-link' }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  // useSyncExternalStore, not an effect: the cookie is external state, and the
  // server has no access to document, so it renders the signed-out label.
  const signedIn = useSyncExternalStore(subscribe, readMarker, () => false);

  const current = pathname === '/account' || pathname.startsWith('/account/');
  return (
    <Link href="/account" className={className} aria-current={current ? 'page' : undefined}>
      {signedIn ? 'Account' : 'Sign in'}
    </Link>
  );
}
