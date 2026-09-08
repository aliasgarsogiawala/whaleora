import Image from 'next/image';
import { ContactForm } from '@/components/contact-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact & FAQ — Whaleora', description: 'Product questions, order support, partnerships and workshops. Reach Whaleora by email or WhatsApp.' };

export default function ContactPage() {
  return <main className="page-main contact-page">
    <section className="contact-hero shell">
      <div className="contact-hero-copy">
        <p className="eyebrow dark">Help &amp; support</p>
        <h1>A real person<br /><em>reads these.</em></h1>
        <p>Product questions, an order that went sideways, a partnership, or something we haven’t thought of. WhatsApp is fastest; email gets a proper answer.</p>
      </div>
      <figure className="contact-hero-visual">
        <Image src="/stock/journey-city.webp" fill priority sizes="(max-width: 900px) 100vw, 34vw" alt="Woman moving through the city" />
        <figcaption>Questions welcome. Judgment never.</figcaption>
      </figure>
    </section>
    <ContactForm />
  </main>;
}
