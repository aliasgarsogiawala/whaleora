'use client';

import { Pause, Play } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import type { ReviewContent, Testimonial } from '@/lib/content/types';

export function TestimonialsMarquee({ items, settings }: { items: Testimonial[]; settings: ReviewContent['settings'] }) {
  const [paused, setPaused] = useState(false);
  const testimonials = items.filter((item) => item.visible);
  if (!settings.showWritten || !testimonials.length) return null;
  return <section className={`testimonials-marquee ${paused ? 'is-paused' : ''}`} style={{ '--marquee-seconds': `${settings.marqueeSeconds}s`, '--marquee-reverse-seconds': `${settings.marqueeSeconds + 10}s` } as CSSProperties} aria-labelledby="written-reviews-title">
    <div className="shell testimonials-toolbar">
      <div><h2 id="written-reviews-title">{settings.writtenTitle}</h2>{settings.writtenSubtitle && <p>{settings.writtenSubtitle}</p>}{testimonials.some((item) => item.demo) && <p>Sample testimonials for preview. Demo names and quotes are fictional.</p>}</div>
      <button type="button" className="testimonials-pause" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? 'Resume testimonial scrolling' : 'Pause testimonial scrolling'}>
        {paused ? <Play size={14} /> : <Pause size={14} />}<span>{paused ? 'Resume' : 'Pause'}</span>
      </button>
    </div>
    {[testimonials.filter((item) => item.row === 1), testimonials.filter((item) => item.row === 2)].map((row, rowIndex) => row.length > 0 && <div className="testimonial-viewport" key={rowIndex}>
      <div className={`testimonial-track ${rowIndex === 1 ? 'reverse' : ''}`}>
        {[false, true].map((duplicate) => <div className="testimonial-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
          {row.map((testimonial) => <figure className="written-review" key={testimonial.id}>
            <blockquote>“{testimonial.quote}”</blockquote>
            <figcaption><i aria-hidden="true" /><strong>{testimonial.name}</strong><span>{testimonial.detail}{testimonial.demo ? ' · Demo' : ''}</span></figcaption>
          </figure>)}
        </div>)}
      </div>
    </div>)}
  </section>;
}
