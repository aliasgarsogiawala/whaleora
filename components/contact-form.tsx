'use client';

import { useState } from 'react';
import { featuredFaqs } from '@/lib/content/faq';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  return <>
    <section className="support-grid shell section-pad">
      <div className="support-options">
        <article><span>01</span><h2>WhatsApp</h2><p>Fastest for a quick question, an order status, or working out which product suits you.</p><a href="https://wa.me/8169219734?text=Hi%20Whaleora!%20I%20have%20an%20inquiry.">Message us now ↗</a></article>
        <article><span>02</span><h2>Orders &amp; products</h2><p>Anything about an order, a fault, a return, or a spec that isn’t on the page.</p><a href="mailto:hello@whaleora.com">hello@whaleora.com ↗</a></article>
        <article><span>03</span><h2>Partnerships &amp; workshops</h2><p>Campuses, workplaces, community groups, retail. Tell us roughly how many people and we’ll go from there.</p><a href="mailto:hello@whaleora.com?subject=Partnership%20enquiry">Start a partnership enquiry ↗</a></article>
      </div>
      <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <p className="eyebrow dark">Send an enquiry</p>
        <label>Full name<input name="name" autoComplete="name" required /></label>
        <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
        <label>What’s this about?<select name="subject"><option>Product question</option><option>Order support</option><option>Something arrived faulty</option><option>Partnership</option><option>Workshop</option><option>Something else</option></select></label>
        <label>Your message<textarea name="message" rows={5} required /></label>
        <button className="button button-primary" type="submit">{submitted ? 'Thanks — noted' : 'Send it'} <span>→</span></button>
        {submitted && <p className="form-note">This build captures the form but doesn’t deliver it yet. For anything urgent, email hello@whaleora.com or message us on WhatsApp.</p>}
      </form>
    </section>
    <section className="faq-section shell section-pad">
      <div><p className="eyebrow dark">Asked most often</p><h2>The questions people email us.</h2></div>
      <div>{featuredFaqs.map((item) => <details key={item.id}><summary>{item.question}<span>＋</span></summary><p>{item.answer}</p></details>)}</div>
    </section>
  </>;
}
