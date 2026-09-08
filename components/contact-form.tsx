'use client';

import { useState } from 'react';

const faqs = [
  ['Are these legal to carry?', 'Our current guidance is that Whaleora’s everyday tools are legal to carry in most jurisdictions in India. Rules genuinely do vary — pepper spray most of all — so check what applies where you live and where you’re travelling. We’d rather you check first than find out at a security desk.'],
  ['How loud is 130dB, really?', 'Loud enough that people in the street look up, which is the entire point. For reference, it is in the range of a smoke alarm held at arm’s length. Our published spec is a 130dB dual-siren on the Personal SOS Alarm and 120dB on the Survival Whistle.'],
  ['Can I take a safety kit on a flight?', 'The whistle, yes. Pepper spray is prohibited on effectively every airline — cabin and usually checked too — and the window breaker is a sharp tool that belongs in a car. Check your carrier’s list before you pack rather than at the counter.'],
  ['Do the alarms need charging?', 'No. The SOS Alarm runs on a replaceable CR2032 coin cell, and one comes in the box. The whistle and the window breaker have no battery and no electronics at all, which is exactly why we sell them alongside the alarm.'],
  ['Something arrived faulty. Now what?', 'Email hello@whaleora.com and tell us what it did. We’ll replace it — you don’t have to build a case for it first. Please get in touch before posting anything back so we can tell you where to send it.'],
];

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
      <div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>＋</span></summary><p>{answer}</p></details>)}</div>
    </section>
  </>;
}
