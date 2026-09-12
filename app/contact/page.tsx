import { ContactForm } from '@/components/contact-form';
import { whatsappHref } from '@/lib/content/contact';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Whaleora',
  description: 'WhatsApp, email, or send an enquiry. A person at Whaleora reads these — product questions, orders, partnerships, workshops.',
};

const enquiryWhatsapp = whatsappHref('Hi Whaleora! I have an inquiry.');

export default function ContactPage() {
  return (
    <main className="page-main contact-page">
      <section className="safety-hero safety-hero-solo">
        <div className="shell safety-hero-grid">
          <div>
            <p className="eyebrow dark">Help · Support · Partnerships</p>
            <h1>A real person<br /><em>reads these.</em></h1>
            <p>Product questions, an order that went sideways, a partnership, or something we haven’t thought of. WhatsApp is fastest; email if it needs a paper trail.</p>
            <nav className="safety-jump" aria-label="On this page">
              <a href="#enquiry">Send an enquiry</a>
              <a href={enquiryWhatsapp}>WhatsApp</a>
              <a href="mailto:hello@whaleora.com">Email</a>
              <a href="#faq">FAQs</a>
            </nav>
          </div>
        </div>
      </section>
      <ContactForm />
    </main>
  );
}
