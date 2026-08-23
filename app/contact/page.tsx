import { ContactForm } from '@/components/contact-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact & FAQ — Whaleora', description: 'Get support with Whaleora products, orders, partnerships, workshops and general enquiries.' };

export default function ContactPage() {
  return <main className="page-main contact-page"><section className="contact-hero shell"><p className="eyebrow dark">Help & support</p><h1>Need help?<br /><em>We’re here.</em></h1><p>Product questions, orders, partnerships, workshops or something else—choose the channel that feels easiest.</p></section><ContactForm /></main>;
}
