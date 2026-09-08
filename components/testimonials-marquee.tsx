'use client';

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';

// Fictional copy and names, used only to preview the testimonial layout.
const testimonials = [
  { quote: 'It lives next to my keys now. I don’t have to remember to pack it separately.', name: 'Aarohi S.', detail: 'Personal SOS Alarm' },
  { quote: 'I liked that I could understand it without sitting through a tutorial.', name: 'Riya M.', detail: 'Personal SOS Alarm' },
  { quote: 'Small enough for the side pocket I actually use, not the bottom of my bag.', name: 'Meera K.', detail: 'Pepper Spray' },
  { quote: 'No charging cable. No app. Just something useful on my keyring.', name: 'Dev P.', detail: 'Survival Whistle' },
  { quote: 'We picked a spot in the car for it, and made sure everyone knew where it was.', name: 'Kabir A.', detail: 'Window Breaker' },
  { quote: 'The simple design is what made me want to carry it every day.', name: 'Sana R.', detail: 'Personal SOS Alarm' },
  { quote: 'I clipped it to my travel bag before I packed anything else.', name: 'Neha D.', detail: 'Survival Whistle' },
  { quote: 'I came for one thing. The clear product details helped me choose the right one.', name: 'Ishaan V.', detail: 'Everyday essentials' },
];

export function TestimonialsMarquee() {
  const [paused, setPaused] = useState(false);
  return <section className={`testimonials-marquee ${paused ? 'is-paused' : ''}`} aria-labelledby="written-reviews-title">
    <div className="shell testimonials-toolbar">
      <div><h2 id="written-reviews-title">A few words from the everyday.</h2><p>Sample testimonials for preview. Names and quotes are fictional.</p></div>
      <button type="button" className="testimonials-pause" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? 'Resume testimonial scrolling' : 'Pause testimonial scrolling'}>
        {paused ? <Play size={14} /> : <Pause size={14} />}<span>{paused ? 'Resume' : 'Pause'}</span>
      </button>
    </div>
    {[testimonials.slice(0, 4), testimonials.slice(4)].map((row, rowIndex) => <div className="testimonial-viewport" key={rowIndex}>
      <div className={`testimonial-track ${rowIndex === 1 ? 'reverse' : ''}`}>
        {[false, true].map((duplicate) => <div className="testimonial-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
          {row.map((testimonial) => <figure className="written-review" key={testimonial.name}>
            <blockquote>“{testimonial.quote}”</blockquote>
            <figcaption><i aria-hidden="true" /><strong>{testimonial.name}</strong><span>{testimonial.detail}</span></figcaption>
          </figure>)}
        </div>)}
      </div>
    </div>)}
  </section>;
}
