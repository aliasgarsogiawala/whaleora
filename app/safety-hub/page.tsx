import Image from 'next/image';
import Link from 'next/link';
import { SafetyHubExplorer } from '@/components/safety-hub';
import { EmergencyCard } from '@/components/emergency-card';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Safety Hub — free guides & checklists | Whaleora', description: 'Practical personal-safety guides, checklists and tools for commutes, campus life and travel. Free to read, no signup.' };

export default function SafetyHubPage() {
  return <main className="page-main safety-page">
    <section className="safety-hero"><div className="shell safety-hero-grid">
      <div>
        <p className="eyebrow">Free · No signup · No email gate</p>
        <h1>Everything useful we know,<br /><em>given away.</em></h1>
        <p>Checklists and short reads for commutes, campus life, travel and working late. Written to be genuinely useful on a second read — not to scare you into buying an alarm.</p>
        <a href="#library" className="button button-light">Jump to the library ↓</a>
      </div>
      <figure className="safety-hero-visual">
        <Image src="/stock/journey-night.webp" fill priority sizes="(max-width: 900px) 100vw, 32vw" alt="Woman out late in the city" />
        <figcaption>Useful wherever the day takes you.</figcaption>
      </figure>
    </div></section>

    <section className="featured-guide shell section-pad">
      <div>
        <p className="eyebrow dark">The one to read first</p>
        <h2>Ten habits that take a minute each.</h2>
        <p>Personal safety isn’t about living on alert — that’s exhausting and nobody sustains it. It’s about making four or five decisions once, in advance, so you don’t have to make them under pressure. Here are the ten we come back to.</p>
        <span className="guide-soon">7 min read · Publishing soon</span>
      </div>
      <ol>
        <li><span>01</span>Write one emergency number on paper, not just in your phone.</li>
        <li><span>02</span>Put the thing you’d reach for somewhere you can reach it.</li>
        <li><span>03</span>Look at an unfamiliar route before you’re standing in it.</li>
        <li><span>04</span>Tell one person when the plan changes. One is enough.</li>
        <li><span>05</span>When something feels off, leave first and explain later.</li>
      </ol>
    </section>

    <div id="library"><SafetyHubExplorer /></div>
    <EmergencyCard />

    <section className="workshop-cta"><div className="shell">
      <p className="eyebrow">For campuses, workplaces &amp; communities</p>
      <h2>Want this as a session, not a webpage?</h2>
      <p>We run practical safety sessions for universities, workplaces and community groups — and leave the resources behind afterwards.</p>
      <Link href="/institutions" className="button button-light">See how partnerships work →</Link>
    </div></section>
  </main>;
}
