'use client';

import Link from 'next/link';
import { useConvexAuth, useQuery } from 'convex/react';
import { usePathname } from 'next/navigation';
import { api } from '@/convex/_generated/api';

export function AccountLink({ className = 'contact-link' }: { className?: string }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  return <AccountLinkReady className={className} />;
}

function AccountLinkReady({ className }: { className: string }) {
  const pathname = usePathname() ?? '/';
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : 'skip');
  const current = pathname === '/account' || pathname.startsWith('/account/');
  const label = isAuthenticated ? (me?.name?.split(' ')[0] || 'Account') : 'Sign in';
  return (
    <Link href="/account" className={className} aria-current={current ? 'page' : undefined}>
      {label}
    </Link>
  );
}
