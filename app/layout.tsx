import type { Metadata } from 'next';
import { Geist, Lora } from 'next/font/google';
import { SiteFrame } from '@/components/site-frame';
import './globals.css';
import './card-refinements.css';
import './review-videos.css';
import './compact-scale.css';
import './faq-bot.css';

// Lora ships as a variable font: omitting `weight` gives the full 400–700 axis
// in one file, which is what whaleora.vercel.app serves.
const display = Lora({ variable: '--font-display', subsets: ['latin'], style: ['normal', 'italic'], display: 'swap' });
const sans = Geist({ variable: '--font-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://whaleora.com'),
  title: 'Whaleora — Personal safety tools that fit on a keyring',
  description: 'A 130dB SOS alarm, a 120dB whistle, pepper spray and a car window breaker. Honest specs, ₹299 to ₹1,799, free shipping over ₹1,499 across India.',
  openGraph: {
    title: 'Whaleora — Personal safety tools that fit on a keyring',
    description: 'Small enough to forget. Loud enough to matter. Four everyday safety objects, ₹299 to ₹1,799.',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Whaleora personal safety objects' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whaleora — Personal safety tools that fit on a keyring',
    description: 'Small enough to forget. Loud enough to matter. Four everyday safety objects, ₹299 to ₹1,799.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning className={`${display.variable} ${sans.variable}`}><SiteFrame>{children}</SiteFrame></body></html>;
}
