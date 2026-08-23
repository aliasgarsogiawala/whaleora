'use client';

import { useState } from 'react';

const faqs = [
  ['Are the safety tools legal to carry?', 'Whaleora’s current guidance states that its everyday tools are legal to carry in most jurisdictions. Local rules can vary, particularly for pepper spray, so check the rules that apply where you live or travel.'],
  ['How loud is the personal SOS alarm?', 'The current Whaleora product specification lists a 130dB dual-siren.'],
  ['Can I take a safety kit on an aeroplane?', 'Airline and airport rules vary. Pepper spray and some sharp tools may be prohibited. Always review the carrier and destination guidance before packing.'],
  ['Do personal alarms require batteries?', 'The current Whaleora SOS Alarm specification lists a replaceable CR2032 battery, included with the product.'],
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  return <><section className="support-grid shell section-pad"><div className="support-options"><article><span>01</span><h2>Orders & products</h2><p>Help choosing an object, product questions or order support.</p><a href="mailto:hello@whaleora.com">hello@whaleora.com ↗</a></article><article><span>02</span><h2>Partnerships</h2><p>Campuses, workplaces, workshops, retail and community programmes.</p><a href="mailto:hello@whaleora.com">Start an enquiry ↗</a></article><article><span>03</span><h2>WhatsApp</h2><p>A direct channel for quick questions and institutional conversations.</p><a href="https://wa.me/8169219734?text=Hi%20Whaleora!%20I%20have%20an%20inquiry.">Message Whaleora ↗</a></article></div><form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><p className="eyebrow dark">Send an enquiry</p><label>Full name<input name="name" required /></label><label>Email address<input type="email" name="email" required /></label><label>How can we help?<select name="subject"><option>Product question</option><option>Order support</option><option>Partnership</option><option>Workshop</option><option>General enquiry</option></select></label><label>Message<textarea name="message" rows={5} required /></label><button className="button button-primary" type="submit">{submitted ? 'Message ready — thank you' : 'Send message →'}</button>{submitted && <p className="form-note">This prototype has captured the interaction only. Connect Whaleora’s form service to deliver enquiries.</p>}</form></section><section className="faq-section shell section-pad"><div><p className="eyebrow dark">Frequently asked</p><h2>Useful answers,<br /><em>kept simple.</em></h2></div><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>＋</span></summary><p>{answer}</p></details>)}</div></section></>;
}
