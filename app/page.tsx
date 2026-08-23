import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/commerce';
import { personas } from '@/data/guides';
import { products } from '@/data/products';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <Image className="hero-photo" src="/lifestyle/mumbai-commute-hero.webp" alt="A confident woman moving through a sunlit Mumbai transit concourse" fill priority sizes="100vw" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">Personal safety, reimagined</p>
          <h1>Move through life<br /><em>on your terms.</em></h1>
          <p className="hero-intro">Thoughtfully designed safety essentials for a calmer, more prepared everyday life.</p>
          <div className="hero-actions"><Link href="/products" className="button button-primary">Shop everyday safety <span>→</span></Link><Link href="/safety-hub" className="text-link">Explore the Safety Hub <span>↗</span></Link></div>
        </div>
        <Link href="/products/sos-alarm" className="hero-product" aria-label="View Personal SOS Alarm"><div><span>Everyday carry · 01</span><strong>Personal SOS Alarm</strong></div><Image src="/products/sos-alarm-mockup.webp" width={290} height={290} alt="Whaleora Personal SOS Alarm" priority /></Link>
        <div className="hero-index">01 <span /> Prepared, not afraid.</div>
      </section>

      <section className="manifesto shell section-pad">
        <div><p className="eyebrow dark">A calmer point of view</p><span className="section-number">02</span></div>
        <h2>Safety shouldn’t feel scary. <em>It should feel like a quiet kind of confidence.</em></h2>
        <div className="manifesto-copy"><p>Whaleora makes practical safety tools feel at home in modern everyday life—beside your keys, phone and the things you already carry.</p><Link href="/about" className="arrow-link">Our philosophy <span>↗</span></Link></div>
      </section>

      <section className="collection-section section-pad">
        <div className="shell section-heading"><div><p className="eyebrow dark">The everyday collection</p><h2>Objects for a<br /><em>prepared life.</em></h2></div><p>Compact, considered and made to stay close. No complicated language. No panic-led design.</p></div>
        <div className="product-grid shell">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
        <div className="center-action"><Link href="/products" className="button button-outline">Explore all objects <span>→</span></Link></div>
      </section>

      <section className="story-split">
        <div className="story-image"><Image src="/lifestyle/sos-alarm-flatlay.webp" alt="Whaleora personal alarm in an everyday flat-lay composition" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className="story-copy"><p className="eyebrow">The object story · Personal SOS Alarm</p><h2>Small enough to carry.<br /><em>Loud enough to be noticed.</em></h2><p>Designed to draw attention with a 130dB dual-siren and strobe light when its pull pin is removed.</p><dl><div><dt>130dB</dt><dd>Dual-siren output</dd></div><div><dt>38g</dt><dd>Compact carry</dd></div><div><dt>01</dt><dd>Simple pull-pin action</dd></div></dl><Link href="/products/sos-alarm" className="button button-light">Meet the SOS Alarm <span>→</span></Link></div>
      </section>

      <section className="how-section shell section-pad">
        <div className="section-heading"><div><p className="eyebrow dark">How it works</p><h2>Simple by<br /><em>design.</em></h2></div><p>Nothing to unlock. Nothing to search for. The personal alarm is designed around one direct action.</p></div>
        <ol className="how-steps"><li><span>01</span><strong>Carry</strong><p>Clip it somewhere easy to reach.</p></li><li><span>02</span><strong>Pull</strong><p>Remove the pin to activate.</p></li><li><span>03</span><strong>Alert</strong><p>The siren and strobe draw attention.</p></li></ol>
      </section>

      <section className="moments section-pad">
        <div className="shell moments-head"><p className="eyebrow dark">Designed for real life</p><h2>Safety lives in the<br /><em>in-between moments.</em></h2></div>
        <div className="moments-grid shell"><article className="moment-large"><Image src="/lifestyle/mumbai-commute-hero.webp" alt="Morning commute in Mumbai" fill sizes="65vw" /><div><small>01 · The commute</small><h3>Early trains.<br />Late finishes.</h3></div></article><article className="moment-small"><Image src="/lifestyle/whistle-bag-shot.webp" alt="Whaleora whistle attached to an everyday bag" fill sizes="35vw" /><div><small>02 · On the move</small><h3>Ready, within reach.</h3></div></article></div>
        <div className="scenario-ticker"><span>Campus</span><span>Commute</span><span>Solo travel</span><span>Work</span><span>Everyday carry</span></div>
      </section>

      <section className="hub-preview section-pad">
        <div className="shell hub-intro"><div><p className="eyebrow">Whaleora Safety Hub</p><h2>Preparedness<br /><em>is a habit.</em></h2></div><div><p>Practical guidance designed to be returned to—not doom-scrolled once.</p><Link href="/safety-hub" className="button button-light">Enter the Safety Hub <span>↗</span></Link></div></div>
        <div className="shell editorial-grid"><Link href="/safety-hub" className="feature-story"><span>Featured guide · 7 min read</span><h3>Ten small habits for moving well through everyday life.</h3><p>A calm, useful reset for commutes, travel and the places between.</p><strong>Read the field note →</strong></Link><div className="secondary-stories"><Link href="/safety-hub"><small>Checklist · Travel</small><h3>Before the cab arrives</h3><span>04 min ↗</span></Link><Link href="/safety-hub"><small>Tool · Emergency prep</small><h3>Build a contact card</h3><span>05 min ↗</span></Link></div></div>
      </section>

      <section className="persona-section shell section-pad"><div className="section-heading"><div><p className="eyebrow dark">Find your starting point</p><h2>Who are you<br /><em>today?</em></h2></div><p>Choose the context that feels closest. The Safety Hub will meet you there.</p></div><div className="persona-grid">{personas.map((persona, index) => <Link key={persona.title} href={`/safety-hub?category=${encodeURIComponent(persona.category)}`}><small>0{index + 1}</small><h3>{persona.title}</h3><p>{persona.description}</p><span>Explore ↗</span></Link>)}</div></section>

      <section className="partnership-strip"><div className="shell"><p className="eyebrow">Institutional partnerships</p><h2>Safer people.<br /><em>Stronger communities.</em></h2><p>Programmes, practical education and thoughtfully chosen products for campuses, workplaces and community organisations.</p><div className="partnership-types"><span>Campuses</span><span>Corporate wellness</span><span>Community programmes</span><span>Retail</span></div><Link href="/institutions" className="button button-light">Build a safer community <span>→</span></Link></div></section>

      <section className="founder-story"><div className="founder-photo"><Image src="/founder/sheuli-founder.webp" fill alt="Sheuli, founder of Whaleora" sizes="(max-width: 800px) 100vw, 58vw" /></div><div className="founder-copy"><p className="eyebrow dark">A word from the founder</p><blockquote>“Safety should be something you’re proud to carry, not something you hesitate to buy.”</blockquote><p>Whaleora began with one question: why do the tools meant to help us feel prepared so often feel intimidating and difficult?</p><p>We are building a calmer alternative—thoughtful products, useful education and a community that treats preparedness as part of everyday life.</p><cite>Sheuli<br /><span>Founder, Whaleora</span></cite><Link href="/about" className="arrow-link">Read our story <span>↗</span></Link></div></section>
    </main>
  );
}
