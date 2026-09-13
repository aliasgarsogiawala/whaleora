'use client';

import { useState, type FormEvent } from 'react';
import { whatsappHref } from '@/lib/content/contact';
import { featuredFaqs } from '@/lib/content/faq';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not send that just now.');
      form.reset();
      setStatus('sent');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'We could not send that just now.');
      setStatus('error');
    }
  }

  return <>
    <section className="support-grid shell section-pad" id="enquiry">
      <div className="support-options">
        <article><span>01</span><h2>WhatsApp</h2><p>Fastest for a quick question, an order status, or working out which product suits you.</p><a href={whatsappHref('Hi Whaleora! I have an inquiry.')} className="icon-link">Message us now <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></a></article>
        <article><span>02</span><h2>Orders &amp; products</h2><p>Anything about an order, a fault, a return, or a spec that isn’t on the page.</p><a href="mailto:hello@whaleora.com" className="icon-link">hello@whaleora.com <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></a></article>
        <article><span>03</span><h2>Partnerships &amp; workshops</h2><p>Campuses, workplaces, community groups, retail. Tell us roughly how many people and we’ll go from there.</p><a href="mailto:hello@whaleora.com?subject=Partnership%20enquiry" className="icon-link">Start a partnership enquiry <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" /></a></article>
      </div>
      <form className="contact-form" onSubmit={send}>
        <p className="eyebrow dark">Send an enquiry</p>
        <label>Full name<input name="name" autoComplete="name" maxLength={80} required /></label>
        <label>Email address<input type="email" name="email" autoComplete="email" maxLength={160} required /></label>
        <label>What’s this about?<select name="subject"><option>Product question</option><option>Order support</option><option>Something arrived faulty</option><option>Partnership</option><option>Workshop</option><option>Something else</option></select></label>
        <label>Your message<textarea name="message" rows={5} maxLength={2000} required /></label>
        <label className="visually-hidden" aria-hidden="true"><span>Company</span><input name="company" tabIndex={-1} autoComplete="off" /></label>
        <button className="button button-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent — thank you' : 'Send it'} <span aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span></button>
        {status === 'sent' && <p className="form-note" role="status">Thanks — it’s in the inbox at hello@whaleora.com. We usually reply within a working day.</p>}
        {status === 'error' && <p className="form-note form-note-error" role="alert">{error} You can also email hello@whaleora.com or message us on WhatsApp.</p>}
      </form>
    </section>
    <section className="faq-section shell section-pad" id="faq">
      <div><p className="eyebrow dark">Asked most often</p><h2>The questions people email us.</h2></div>
      <div>{featuredFaqs.map((item) => <details key={item.id}><summary>{item.question}<span aria-hidden="true"><Plus size={17} strokeWidth={2} /></span></summary><p>{item.answer}</p></details>)}</div>
    </section>
  </>;
}
