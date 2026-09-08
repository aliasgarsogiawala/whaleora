'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MotionDirector() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (reduced) {
      reveals.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.03 });

    reveals.forEach((element) => observer.observe(element));

    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty('--page-progress', (max > 0 ? window.scrollY / max : 0).toFixed(4));
      root.style.setProperty('--hero-drift', `${Math.min(window.scrollY, 900) * 0.075}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // A single delegated listener also covers cards added by client-side filters.
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const tiltSelector = '.product-visual';
    let activeCard: HTMLElement | null = null;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const resetCard = () => {
      activeCard?.style.removeProperty('--depth-x');
      activeCard?.style.removeProperty('--depth-y');
      activeCard = null;
    };
    const updatePointer = () => {
      pointerFrame = 0;
      if (!activeCard) return;
      const bounds = activeCard.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height));
      activeCard.style.setProperty('--depth-x', `${(0.5 - y) * 2}deg`);
      activeCard.style.setProperty('--depth-y', `${(x - 0.5) * 3}deg`);
    };
    const onPointer = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const card = event.target instanceof Element ? event.target.closest<HTMLElement>(tiltSelector) : null;
      if (activeCard !== card) { resetCard(); activeCard = card; }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (activeCard && !pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerleave', resetCard);
    window.addEventListener('blur', resetCard);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', resetCard);
      window.removeEventListener('blur', resetCard);
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      resetCard();
      if (frame) window.cancelAnimationFrame(frame);
      document.body.classList.remove('motion-ready');
    };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true" />;
}
