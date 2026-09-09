import Image from 'next/image';
import { ContactForm } from '@/components/contact-form';
import { FaqBot } from '@/components/faq-bot';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & FAQ — Whaleora',
  description: 'Ask the Whaleora FAQ assistant about products, shipping, flights and workshops — or reach a person on WhatsApp and email.',
};

export default function ContactPage() {
  return (
    <main className="page-main contact-page">
      <section className="contact-hero shell">
        <div className="contact-hero-copy">
          <p className="eyebrow dark">Help &amp; support</p>
          <h1>A real person<br /><em>reads these.</em></h1>
          <p>Product questions, an order that went sideways, a partnership, or something we haven’t thought of. Start with the assistant, or skip straight to WhatsApp.</p>
        </div>
        <figure className="contact-hero-visual">
          <Image src="/stock/journey-city.webp" fill priority sizes="(max-width: 900px) 100vw, 34vw" alt="Woman moving through the city" />
          <figcaption>Questions welcome. Judgment never.</figcaption>
        </figure>
      </section>
      <section className="faq-bot-stage shell">
        <div className="faq-bot-stage-copy">
          <p className="eyebrow dark">FAQ assistant</p>
          <h2>Ask it the way you’d ask us.</h2>
          <p>Shipping, flights, batteries, pepper-spray rules, campus sessions. It answers from what we actually sell — and hands you to WhatsApp when a guess would be worse than silence.</p>
        </div>
        <FaqBot variant="page" />
      </section>
      <ContactForm />
    </main>
  );
}
