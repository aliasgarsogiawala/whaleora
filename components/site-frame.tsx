'use client';
import { usePathname } from 'next/navigation';
import { CommerceProvider, Footer, Header } from './commerce';
import { MotionDirector } from './brand-motion';

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return children;
  return <CommerceProvider><MotionDirector /><Header />{children}<Footer /></CommerceProvider>;
}
