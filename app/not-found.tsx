import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found — Whaleora' };

/**
 * Renders inside the root layout, so a wrong URL keeps the header, the bag and
 * a way back rather than dropping the visitor on an unbranded error screen.
 */
export default function NotFound() {
  return <main className="page-main not-found shell section-pad">
    <p className="eyebrow dark">Error 404</p>
    <h1>This page isn’t here.<br /><em>The four objects are.</em></h1>
    <p className="not-found-lede">The link may be old, or we may have moved something. Nothing is wrong with your order or your bag — both are exactly where you left them.</p>
    <div className="hero-actions">
      <Link href="/products" className="button button-primary">Shop the collection <span>→</span></Link>
      <Link href="/" className="text-link">Back to the home page <span>↗</span></Link>
    </div>
    <ul className="not-found-links">
      <li><Link href="/safety-hub" className="arrow-link">Safety Hub <span>↗</span></Link></li>
      <li><Link href="/about" className="arrow-link">Our story <span>↗</span></Link></li>
      <li><Link href="/contact" className="arrow-link">Contact &amp; FAQ <span>↗</span></Link></li>
    </ul>
  </main>;
}
