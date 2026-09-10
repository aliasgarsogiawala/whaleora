import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Whaleora — Safety should not feel scary',
  description: 'We believe personal safety should feel calm, intuitive and accessible—not intimidating.',
};

const founderStory = [
  'Whaleora began with a simple question: Why do the tools meant to keep us safe often feel intimidating and difficult? I wanted to change that.',
  "Through months of research, conversations with manufacturers, testing products, and learning every part of the design process from scratch, I realized that safety doesn't need to create fear—it should create confidence.",
  'Every product we create is designed to fit naturally into everyday life. Premium in quality, thoughtful in design, and easy to carry, our goal is to help you feel prepared without constantly reminding you of danger.',
  "Whaleora isn't just about products. It's about creating a future where feeling prepared is part of everyday life. Thank you for being a part of that journey.",
] as const;

const heroMeta = [
  { value: 'Four', label: 'Everyday objects' },
  { value: '₹299', label: 'Where it starts' },
  { value: 'Mumbai', label: 'Designed in India' },
] as const;

const ticker = ['Designed in India', 'Calm by default', 'Carry it daily', 'Built to be used once', 'No fear marketing'] as const;

const audiences = [
  {
    title: 'Students',
    kicker: 'Campus',
    text: 'Late library nights and long walks back to the hostel gate.',
    image: '/stock/journey-campus.webp',
  },
  {
    title: 'Commuters',
    kicker: 'Daily travel',
    text: 'Packed locals, last-mile autos and platforms after dark.',
    image: '/stock/journey-train.webp',
  },
  {
    title: 'Working late',
    kicker: 'After hours',
    text: 'Shifts that end when the streets have already emptied out.',
    image: '/stock/journey-work.webp',
  },
  {
    title: 'Travellers',
    kicker: 'Away from home',
    text: 'New cities, unfamiliar routes and rooms you have never slept in.',
    image: '/stock/journey-travel.webp',
  },
  {
    title: 'Parents',
    kicker: 'For someone else',
    text: 'The quiet reassurance of knowing they are carrying something.',
    image: '/stock/journey-night.webp',
  },
] as const;

const commitments = [
  { label: 'Vision', text: 'A world where every person moves through life with the quiet confidence of knowing they are safe.' },
  { label: 'Mission', text: 'To make personal safety simple, reliable and accessible through thoughtfully designed products, education and partnerships.' },
  { label: 'Promise', text: 'Safety you can trust, when it matters most.' },
] as const;

export default function AboutPage() {
  return (
    <main className="page-main about-page">
      <section className="about-story-hero">
        <div className="about-story-hero-inner">
          <p className="eyebrow dark">About Whaleora</p>
          <h1>Safety shouldn&apos;t<br />feel <em>scary.</em></h1>
          <p>We believe personal safety should feel calm, intuitive and accessible—not intimidating.</p>
          <ul className="about-hero-meta">
            {heroMeta.map((item) => (
              <li key={item.label}>
                <b>{item.value}</b>
                {item.label}
              </li>
            ))}
          </ul>
          <span className="about-scroll-cue" aria-hidden="true"><i /></span>
        </div>
        <figure className="about-hero-figure">
          <Image
            src="/lifestyle/whaleora-hero-campaign.webp"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 49vw"
            alt="A Whaleora safety alarm carried on an everyday bag"
          />
          <figcaption>Made for ordinary days, not worst-case posters</figcaption>
        </figure>
      </section>

      <div className="about-ticker" aria-hidden="true">
        {[0, 1].map((pass) => (
          <p key={pass}>
            {ticker.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        ))}
      </div>

      <section className="founder-chapter" aria-labelledby="founder-story-title">
        <div className="founder-chapter-visual">
          <div className="founder-chapter-image">
            <Image src="/founder/sheuli-founder.webp" fill sizes="(max-width: 900px) 100vw, 48vw" alt="Sheuli, founder of Whaleora" />
          </div>
          <div className="founder-image-wash" />
          <p>Sheuli<br /><span>Founder, Whaleora</span></p>
        </div>
        <div className="founder-chapter-copy">
          <div className="founder-quote" data-reveal>
            <p className="eyebrow dark">A Word from the Founder</p>
            <h2 id="founder-story-title">&ldquo;Safety should be something you&apos;re proud to carry, not something you hesitate to buy.&rdquo;</h2>
          </div>
          <div className="founder-pages">
            {founderStory.map((paragraph, index) => (
              <article data-reveal key={paragraph}>
                <span>0{index + 1}</span>
                <p>{paragraph}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-audience" aria-labelledby="about-audience-title">
        <div className="about-bleed">
          <div className="about-audience-heading" data-reveal>
            <h2 id="about-audience-title">Built for the walk home, the late shift, <em>the ordinary Tuesday.</em></h2>
            <div>
              <p>Safety isn&apos;t one situation. It is a hundred small ones, most of which never turn into a story. Whaleora is designed for those.</p>
              <p className="audience-scroll-hint">Scroll →</p>
            </div>
          </div>
        </div>
        <div className="audience-strip" role="list" aria-label="Who Whaleora is for. Scroll sideways.">
          {audiences.map((audience) => (
            <article role="listitem" key={audience.title}>
              <Image src={audience.image} fill sizes="(max-width: 700px) 78vw, 400px" alt="" />
              <small>{audience.kicker}</small>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="why-chapter">
        <div className="why-chapter-image" aria-hidden="true">
          <Image src="/lifestyle/mumbai-commute-hero.webp" fill sizes="100vw" alt="" />
        </div>
        <div className="shell why-chapter-inner">
          <div data-reveal>
            <p className="eyebrow">Why Whaleora</p>
            <h2>Preparedness belongs in everyday life.</h2>
          </div>
          <div className="why-chapter-copy" data-reveal>
            <p>Whaleora exists to make personal safety simple, reliable and beautifully designed.</p>
            <p>We believe preparedness should become part of everyday life—not something people think about only after an emergency.</p>
            <p>Through thoughtfully crafted products, awareness programmes and institutional partnerships from our base in Mumbai, we are building an ecosystem where safety feels calm, accessible and empowering.</p>
          </div>
        </div>
      </section>

      <section className="confidence-chapter">
        <div className="about-bleed">
          <div className="confidence-heading" data-reveal>
            <h2>Safety isn&apos;t panic.<br /><em>Safety is confidence.</em></h2>
          </div>
          <div className="commitment-stories">
            {commitments.map((commitment, index) => (
              <article data-reveal key={commitment.label}>
                <span>0{index + 1}</span>
                <h3>{commitment.label}</h3>
                <p>{commitment.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
