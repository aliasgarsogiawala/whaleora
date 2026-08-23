import type { Metadata } from 'next';
import { DM_Serif_Display, Manrope } from 'next/font/google';
import { CommerceProvider, Footer, Header } from '@/components/commerce';
import './globals.css';

const display = DM_Serif_Display({ variable: '--font-display', subsets: ['latin'], weight: '400' });
const sans = Manrope({ variable: '--font-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://whaleora.com'),
  title: 'Whaleora — Personal Safety, Reimagined',
  description: 'Thoughtfully designed personal safety essentials, practical guides and community programmes for everyday confidence.',
  openGraph: {
    title: 'Whaleora — Personal Safety, Reimagined',
    description: 'Prepared, not afraid. Thoughtfully designed safety essentials for everyday confidence.',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Whaleora — Personal safety, reimagined' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whaleora — Personal Safety, Reimagined',
    description: 'Prepared, not afraid. Thoughtfully designed safety essentials for everyday confidence.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning className={`${display.variable} ${sans.variable}`}><CommerceProvider><Header />{children}<Footer /></CommerceProvider></body></html>;
}
