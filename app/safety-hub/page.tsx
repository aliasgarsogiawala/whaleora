import Image from 'next/image';
import Link from 'next/link';
import { SafetyHubExplorer } from '@/components/safety-hub';
import { EmergencyCard } from '@/components/emergency-card';
import { hubProgrammes } from '@/data/safety-hub';
import { publishedContent } from '@/lib/content/store';
import { getCatalog } from '@/lib/shopify/catalog';
import { whatsappHref } from '@/lib/content/contact';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Safety Hub — free guides & checklists | Whaleora',
  description: 'Practical personal-safety guides, checklists, emergency numbers and tools for commutes, campus life and travel. Free to read, no signup.',
};

const partnerWhatsapp = whatsappHref('Hi Whaleora! I would like to partner with you for an awareness programme.');

export default async function SafetyHubPage() {
  const [content, catalog] = await Promise.all([publishedContent(), getCatalog()]);
  return (
    <main className="page-main safety-page">
      <section className="safety-hero">
        <div className="shell safety-hero-grid">
          <div>
            <p className="eyebrow dark">Learn · Prepare · Stay safe</p>
            <h1>Everything useful we know,<br /><em>given away.</em></h1>
            <p>Guides, checklists, emergency numbers and a printable contact card — for commutes, campus, travel and working late. Written to be useful on a second read, not to scare you into buying an alarm.</p>
            <nav className="safety-jump" aria-label="On this page">
              <a href="#habits">Ten habits</a>
              <a href="#profiles">Your profile</a>
              <a href="#library">Library</a>
              <a href="#emergency-card">Contact card</a>
              <a href="#programmes">Programmes</a>
            </nav>
          </div>
          <figure className="safety-hero-visual">
            <Image src="/stock/journey-night.webp" fill priority sizes="(max-width: 900px) 100vw, 32vw" alt="Woman out late in the city" />
            <figcaption>Useful wherever the day takes you.</figcaption>
          </figure>
        </div>
      </section>

      <section className="featured-guide shell section-pad" id="habits">
        <div>
          <p className="eyebrow dark">The one to read first</p>
          <h2>Ten habits that take a minute each.</h2>
          <p>Personal safety isn’t about living on alert — that’s exhausting and nobody sustains it. It’s about making a few decisions once, in advance, so you don’t have to make them under pressure.</p>
        </div>
        <ol>
          {content.habits.map((habit, index) => (
            <li key={habit}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {habit}
            </li>
          ))}
        </ol>
      </section>

      <SafetyHubExplorer
        checklists={content.checklists}
        catalog={catalog.map((product) => ({
          slug: product.slug,
          title: product.title,
          shortDescription: product.shortDescription,
          price: product.price,
          currencyCode: product.currencyCode,
          images: product.images,
        }))}
      />
      <EmergencyCard />

      <section className="hub-programmes section-pad" id="programmes">
        <div className="shell">
          <div className="hub-programmes-head">
            <div>
              <p className="eyebrow dark">Awareness programmes</p>
              <h2>Building safer communities together.</h2>
            </div>
            <p>Partnering with institutions to make safety education practical and accessible — then leaving the resources behind so the session isn’t forgotten by Friday.</p>
          </div>
          <div className="hub-programmes-grid">
            {hubProgrammes.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link href="/institutions" className="icon-link">Learn more <ArrowRight size={15} strokeWidth={2} aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="workshop-cta">
        <div className="shell">
          <p className="eyebrow">For campuses, workplaces &amp; communities</p>
          <h2>Want to organise a safety awareness session?</h2>
          <p>Collaborate with us to bring practical safety education to your institution or community. We run the session, leave the resources, and pick the tools to fit the group.</p>
          <a href={partnerWhatsapp} className="button button-light">Partner with us on WhatsApp <span aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span></a>
          <Link href="/institutions" className="text-link">See how partnerships work <span aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span></Link>
        </div>
      </section>
    </main>
  );
}
