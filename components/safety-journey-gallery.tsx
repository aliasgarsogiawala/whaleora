'use client';

import Link from 'next/link';
import { Play, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';
import type { ReviewContent, VideoReview } from '@/lib/content/types';

function ReviewClip({ review, active, paused }: { review: VideoReview; active: boolean; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => {
      if (visible && !paused && !reduced.matches) {
        if (!video.getAttribute('src')) video.src = review.video;
        void video.play().catch(() => { /* Poster remains if autoplay is unavailable. */ });
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= 0.4; sync(); }, { threshold: 0.4 });
    observer.observe(video);
    reduced.addEventListener('change', sync);
    return () => { observer.disconnect(); reduced.removeEventListener('change', sync); video.pause(); };
  }, [review.video, paused]);

  return <article className={`journey-card review-card ${active ? 'is-active' : ''}`}>
    <video ref={ref} poster={review.poster} muted loop playsInline preload="none" aria-hidden="true" />
    <div className="journey-card-shade" />
    <div className="review-card-top"><span>{review.demo ? 'Demo review' : 'Product review'}</span><span>{review.duration}</span></div>
    <span className="review-play" aria-hidden="true"><Play size={21} fill="currentColor" strokeWidth={1} /></span>
    <div className="journey-card-copy"><span>{review.product}</span><h3>{review.title}</h3><p>Watch the {review.demo ? 'sample clip' : 'review'} ↗</p></div>
  </article>;
}

export function SafetyJourneyGallery({ items, settings }: { items: VideoReview[]; settings: ReviewContent['settings'] }) {
  const reviewVideos = items.filter((item) => item.visible);
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const review = selected === null ? null : reviewVideos[selected];
  const openReview = useCallback((index: number) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(index);
  }, [setSelected]);
  const closeReview = useCallback(() => { dialog.current?.close(); }, []);

  useEffect(() => {
    if (selected === null) return;
    const modal = dialog.current;
    if (!modal) return;
    modal.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    void player.current?.play().catch(() => { /* Native controls provide an explicit play action. */ });
    return () => { document.body.style.overflow = previousOverflow; opener.current?.focus({ preventScroll: true }); };
  }, [selected]);

  if (!settings.showVideos || !reviewVideos.length) return null;
  return (
    <section className="journey-section review-section" id="video-reviews" data-reveal>
      <div className="shell journey-heading">
        <div>
          <p className="eyebrow">Product video reviews</p>
          <h2>{settings.videoTitle.split('\n').map((line, index) => index === 0 ? line : <span key={index}><br /><em>{line}</em></span>)}</h2>
        </div>
        <div className="journey-aside">
          <span className="journey-count">{String(reviewVideos.length).padStart(2, '0')}</span>
          <p>{settings.videoSubtitle}{reviewVideos.some((item) => item.demo) && <><br /><span className="review-demo-note">Demo videos are samples, not customer testimonials.</span></>}</p>
        </div>
      </div>

      <RadialScrollGallery
        className="journey-wheel"
        baseRadius={420}
        mobileRadius={255}
        visiblePercentage={54}
        scrollDuration={1800}
        startTrigger="center center"
        onItemSelect={openReview}
        itemLabels={reviewVideos.map((item) => `Play ${item.demo ? 'demo ' : ''}review: ${item.product} — ${item.title}`)}
      >
        {(hoveredIndex) => reviewVideos.map((item, index) => <ReviewClip key={item.id} review={item} active={hoveredIndex === index} paused={selected !== null} />)}
      </RadialScrollGallery>

      <div className="journey-instruction" aria-hidden="true"><span>Scroll to explore · Tap to play</span><i /></div>

      <dialog ref={dialog} className="review-dialog" aria-labelledby="review-player-title" onClose={() => { player.current?.pause(); setSelected(null); }} onClick={(event) => { if (event.target === event.currentTarget) closeReview(); }}>
        {review && <div className="review-player-shell">
          <div className="review-player-head"><span>{review.demo ? 'Demo review' : 'Product review'} · {review.duration}</span><button type="button" onClick={closeReview} aria-label="Close video"><X size={22} /></button></div>
          <video key={review.id} ref={player} src={review.video} poster={review.poster} controls autoPlay muted playsInline preload="metadata" aria-label={`${review.product} video review`} />
          <div className="review-player-caption"><h2 id="review-player-title">{review.title}</h2>{review.demo && <p>Sample clip · Not a customer testimonial</p>}<Link href={`/products/${review.slug}`} onClick={closeReview}>Explore {review.product} <span>↗</span></Link></div>
        </div>}
      </dialog>
    </section>
  );
}
