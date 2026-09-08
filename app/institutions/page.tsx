import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Safety programmes for campuses & workplaces — Whaleora', description: 'Safety sessions that people remember, plus resources they keep. For universities, workplaces, community organisations and retail partners.' };

const whatsapp = 'https://wa.me/8169219734?text=Hi%20Whaleora!%20I%20would%20like%20to%20explore%20institutional%20partnerships.';

export default function InstitutionsPage() {
  return <main className="page-main institutions-page">
    <section className="institution-hero"><div className="shell institution-hero-grid">
      <div className="institution-hero-copy">
        <p className="eyebrow">Campuses · Workplaces · Communities</p>
        <h1>Not another slide deck<br />and a <em>signature sheet.</em></h1>
        <div>
          <p>Most safety sessions are attended once and forgotten by Friday. We run the session, leave resources people can go back to, and pick the products to fit the group — not the other way round.</p>
          <a href={whatsapp} className="button button-light">Talk to us on WhatsApp <span>↗</span></a>
        </div>
      </div>
      <figure className="institution-hero-visual">
        <Image src="/stock/journey-campus.webp" fill priority sizes="(max-width: 900px) 100vw, 35vw" alt="Young woman outside on a sunny campus day" />
        <figcaption>For the moments people actually remember.</figcaption>
      </figure>
    </div></section>

    <section className="approach shell section-pad">
      <div><p className="eyebrow dark">How we think about it</p><h2>The session is the product. The objects are the reminder.</h2></div>
      <p>Handing out alarms at an orientation achieves very little on its own — most end up in a drawer by week three. What changes behaviour is a specific conversation about the specific situations your people are actually in, followed by something physical that keeps the conversation present.</p>
    </section>

    <section className="model-steps shell">
      <article><span>01</span><h3>Awareness</h3><p>A frank conversation about the situations that actually come up on your campus or floor.</p></article>
      <article><span>02</span><h3>Education</h3><p>Interactive sessions, not lectures. People practise the thing rather than watch a slide about it.</p></article>
      <article><span>03</span><h3>Products</h3><p>Tools matched to the group. A night-shift team and a first-year cohort need different things.</p></article>
      <article><span>04</span><h3>Resources</h3><p>Digital and printed material that stays available long after we’ve left the room.</p></article>
    </section>

    <section className="tracks section-pad"><div className="shell">
      <p className="eyebrow dark">Four ways we work together</p>
      <div className="track-grid">
        <article><small>Students &amp; faculty</small><h2>Universities<br />&amp; Campuses</h2><p>Orientation weeks, hostel blocks, late-running labs and the walk back from the library.</p><a href={whatsapp}>Enquire on WhatsApp ↗</a></article>
        <article><small>Employee care</small><h2>Corporate<br />Wellness</h2><p>Night shifts, field roles, and the commute your policy doesn’t currently cover.</p><a href={whatsapp}>Enquire on WhatsApp ↗</a></article>
        <article><small>Collective action</small><h2>Community<br />Programmes</h2><p>Adaptable formats for NGOs, resident associations and local groups working on a budget.</p><a href={whatsapp}>Enquire on WhatsApp ↗</a></article>
        <article><small>Stockists</small><h2>Retail &amp;<br />Distribution</h2><p>For shops whose customers ask for this and currently get pointed elsewhere.</p><a href={whatsapp}>Enquire on WhatsApp ↗</a></article>
      </div>
    </div></section>

    <section className="collaboration shell section-pad">
      <div><p className="eyebrow dark">What working with us looks like</p><h2>Four steps, and the first one is just a conversation.</h2></div>
      <ol>
        <li><span>01</span><div><h3>Understand</h3><p>We ask about your people, your context and what’s already been tried.</p></div></li>
        <li><span>02</span><div><h3>Design the programme</h3><p>We propose the mix of session, materials and tools — and what it costs.</p></div></li>
        <li><span>03</span><div><h3>Deliver</h3><p>We run it, on your campus or in your office.</p></div></li>
        <li><span>04</span><div><h3>Support</h3><p>Resources stay accessible afterwards, and we’re reachable if questions come up.</p></div></li>
      </ol>
    </section>

    <section className="institution-cta"><div className="shell">
      <p>No deck required to start</p>
      <h2>Tell us who you’re trying to look after.</h2>
      <a href={whatsapp} className="button button-light">Message us on WhatsApp →</a>
      <Link href="/contact" className="text-link">Or email an enquiry ↗</Link>
    </div></section>
  </main>;
}
