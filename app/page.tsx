import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/commerce';
import { SafetyJourneyGallery } from '@/components/safety-journey-gallery';
import { TestimonialsMarquee } from '@/components/testimonials-marquee';
import { Chooser, Objections, TrustBar } from '@/components/home-sections';
import { getCatalog } from '@/lib/shopify/catalog';
import { publishedContent } from '@/lib/content/store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [catalog, content] = await Promise.all([getCatalog(), publishedContent()]);
  return (
    <main>
      <section className="hero" data-hero-overlay>
        <div className="hero-media">
          {/* Pexels 35574649, Anupriya Datta — Mumbai commute at CST. Pexels License. */}
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/lifestyle/hero-commute-poster.jpg"
            aria-hidden="true"
          >
            <source src="/lifestyle/hero-commute.mp4" type="video/mp4" />
          </video>
          <Image
            className="hero-still"
            src="/lifestyle/whaleora-hero-campaign.webp"
            alt="A woman carrying a small personal-safety keyring outside a Mumbai transit station at blue hour"
            fill
            sizes="100vw"
          />
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-inner shell">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">Four objects · ₹299 to ₹1,799</p>
            <h1>Small enough to forget.<br /><em>Loud enough to matter.</em></h1>
            <p className="hero-intro">A 130dB alarm, a 120dB whistle, a pepper spray and a car window breaker. Each one does a single job, needs no app, and lives on your keyring.</p>
            <div className="hero-actions">
              <Link href="/products" className="button button-primary">Shop the collection <span>→</span></Link>
              <Link href="/products/sos-alarm" className="text-link">Start with the SOS Alarm <span>↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="collection-section section-pad" data-reveal>
        <div className="shell section-heading">
          <div>
            <p className="eyebrow dark">The collection</p>
            <h2>Four objects. Nothing you don’t need.</h2>
          </div>
          <p>We don’t make a fifth thing just to fill the page. Every product here has a battery you can replace yourself, or no battery at all.</p>
        </div>
        <div className="product-grid shell">{catalog.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
        <div className="center-action"><Link href="/products" className="button button-outline">See all four, with specs <span>→</span></Link></div>
      </section>

      <Chooser catalog={catalog} />

      <section className="story-split" data-reveal>
        <div className="story-image"><Image src="/lifestyle/sos-alarm-flatlay.webp" alt="Whaleora personal alarm in an everyday flat-lay composition" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className="story-copy">
          <p className="eyebrow">Personal SOS Alarm · ₹1,799</p>
          <h2>One pull. No app, no pairing, no charging.</h2>
          <p>Pull the pin and it does two things at once — a 130dB dual-siren and a strobe. Push the pin back in and it stops. That’s the entire interface, and it’s deliberate: anything you have to unlock or remember is one step too many.</p>
          <dl><div><dt>130dB</dt><dd>Dual siren + strobe</dd></div><div><dt>38g</dt><dd>Sits on a keyring</dd></div><div><dt>CR2032</dt><dd>Swap it yourself</dd></div></dl>
          <Link href="/products/sos-alarm" className="button button-light">Buy the SOS Alarm — ₹1,799 <span>→</span></Link>
        </div>
      </section>

      <section className="how-section shell section-pad" data-reveal>
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">How the alarm works</p>
            <h2>Three seconds to learn. You’ll never forget it.</h2>
          </div>
          <p>There is no menu, no pairing screen and no subscription. If you can pull a keyring apart, you already know how to use it.</p>
        </div>
        <ol className="how-steps">
          <li><span>01</span><strong>Carry</strong><p>Clip it to a keyring or bag strap, somewhere you can reach without looking.</p></li>
          <li><span>02</span><strong>Pull</strong><p>Yank the top pin out. Siren and strobe start immediately and stay on.</p></li>
          <li><span>03</span><strong>Reset</strong><p>Push the pin back in to stop it. Nothing to reconfigure afterwards.</p></li>
        </ol>
      </section>

      <SafetyJourneyGallery items={content.videos} settings={content.settings} />
      <TestimonialsMarquee items={content.testimonials} settings={content.settings} />

      <div className="scenario-ticker" aria-hidden="true"><span>Campus</span><span>Late commute</span><span>Solo travel</span><span>Night shift</span><span>Everyday carry</span></div>

      <section className="hub-preview section-pad" data-reveal>
        <div className="shell hub-intro">
          <div>
            <p className="eyebrow">Whaleora Safety Hub</p>
            <h2>Guides worth reading twice.</h2>
          </div>
          <div>
            <p>Checklists and short reads on commuting, campus life and travel. Free, no signup, and written to be useful on a second read — not doom-scrolled once and forgotten.</p>
            <Link href="/safety-hub" className="button button-light">Read the guides <span>↗</span></Link>
          </div>
        </div>
        <div className="shell editorial-grid">
          <Link href="/safety-hub" className="feature-story">
            <span>Featured · 7 min read</span>
            <h3>Ten habits that take a minute each and hold up for years.</h3>
            <p>Sharing a live location. Keeping one number written down on paper. Small things, chosen because they still work when your phone doesn’t.</p>
            <strong>Read the ten habits →</strong>
          </Link>
          <div className="secondary-stories">
            <Link href="/safety-hub"><small>Checklist · Travel</small><h3>Before the cab arrives</h3><span>3 min ↗</span></Link>
            <Link href="/safety-hub#emergency-card"><small>Tool · Emergency prep</small><h3>Build a contact card</h3><span>5 min ↗</span></Link>
          </div>
        </div>
      </section>

      <Objections />

      <section className="partnership-strip" data-reveal>
        <div className="shell">
          <p className="eyebrow">For campuses, workplaces & communities</p>
          <h2>Safety training people <em>actually remember.</em></h2>
          <p>Most safety sessions are a slide deck and a signature sheet. We run the session, leave the resources behind, and fit the products to the group — not the other way round.</p>
          <div className="partnership-types"><span>Universities & campuses</span><span>Corporate wellness</span><span>Community programmes</span><span>Retail & distribution</span></div>
          <Link href="/institutions" className="button button-light">See how partnerships work <span>→</span></Link>
        </div>
      </section>

      <section className="founder-story" data-reveal>
        <div className="founder-photo"><Image src="/founder/sheuli-founder.webp" fill alt="Sheuli, founder of Whaleora" sizes="(max-width: 800px) 100vw, 58vw" /></div>
        <div className="founder-copy">
          <p className="eyebrow dark">Why we started</p>
          <blockquote>“Safety should be something you’re proud to carry, not something you hesitate to buy.”</blockquote>
          <p>I kept finding the same two options: tactical gear covered in warnings, or a pretty keychain that didn’t work. Nothing in between, and nothing I’d actually want on my keys.</p>
          <p>So we build the in-between. Honest specs, prices that don’t need justifying, and guides we give away because a product on its own was never the point.</p>
          <cite>Sheuli<br /><span>Founder, Whaleora</span></cite>
          <Link href="/about" className="arrow-link">Read the full story <span>↗</span></Link>
        </div>
      </section>
    </main>
  );
}
