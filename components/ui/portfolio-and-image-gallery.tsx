'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { forwardRef, type HTMLAttributes, type ReactNode, type Ref, useEffect, useMemo, useRef, useState } from 'react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

function useMergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return useMemo(() => {
    if (refs.every((item) => item == null)) return null;
    return (node: T) => refs.forEach((item) => {
      if (typeof item === 'function') item(node);
      else if (item != null) (item as React.MutableRefObject<T | null>).current = node;
    });
  }, [refs]);
}

function useResponsiveValue(baseValue: number, mobileValue: number) {
  const [value, setValue] = useState(baseValue);
  useEffect(() => {
    const update = () => setValue(window.innerWidth < 768 ? mobileValue : baseValue);
    update();
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(update, 100); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
  }, [baseValue, mobileValue]);
  return value;
}

export interface RadialScrollGalleryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (hoveredIndex: number | null) => ReactNode[];
  scrollDuration?: number;
  visiblePercentage?: number;
  baseRadius?: number;
  mobileRadius?: number;
  startTrigger?: string;
  onItemSelect?: (index: number) => void;
  itemLabels?: readonly string[];
  direction?: 'ltr' | 'rtl';
  disabled?: boolean;
}

export const RadialScrollGallery = forwardRef<HTMLDivElement, RadialScrollGalleryProps>(
  ({ children, scrollDuration = 2500, visiblePercentage = 45, baseRadius = 550, mobileRadius = 220, className = '', startTrigger = 'center center', onItemSelect, itemLabels, direction = 'ltr', disabled = false, ...rest }, ref) => {
    const pinRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLUListElement>(null);
    const childRef = useRef<HTMLLIElement>(null);
    const mergedRef = useMergeRefs(ref, pinRef);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [childHeight, setChildHeight] = useState<number | null>(null);
    const currentRadius = useResponsiveValue(baseRadius, mobileRadius);
    const circleDiameter = currentRadius * 2;
    const clampedVisibility = Math.max(10, Math.min(100, visiblePercentage)) / 100;
    const childrenNodes = useMemo(() => React.Children.toArray(children(hoveredIndex)), [children, hoveredIndex]);
    const childrenCount = childrenNodes.length;

    useEffect(() => {
      const node = childRef.current;
      if (!node) return;
      const observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        setChildHeight(entry.contentRect.height);
        ScrollTrigger.refresh();
      });
      observer.observe(node);
      return () => observer.disconnect();
    }, [childrenCount]);

    useGSAP(() => {
      const pin = pinRef.current;
      const wheel = containerRef.current;
      if (!pin || !wheel || childrenCount === 0) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(wheel.children, { scale: 0.82, autoAlpha: 0 }, {
        scale: 1, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: pin, start: 'top 78%', toggleActions: 'play none none reverse' },
      });
      gsap.to(wheel, {
        rotation: direction === 'rtl' ? -360 : 360,
        ease: 'none',
        scrollTrigger: { trigger: pin, pin: true, start: startTrigger, end: `+=${scrollDuration}`, scrub: 0.8, invalidateOnRefresh: true },
      });
    }, { scope: pinRef, dependencies: [scrollDuration, currentRadius, startTrigger, childrenCount, direction], revertOnUpdate: true });

    if (childrenCount === 0) return null;
    const buffer = childHeight ? childHeight * 0.25 + 60 : 150;
    const visibleAreaHeight = circleDiameter * clampedVisibility + (childHeight ?? 200) / 2 + buffer;

    return (
      <div ref={mergedRef} className={`radial-gallery ${className}`} {...rest}>
        <div className="radial-gallery-mask" style={{ height: visibleAreaHeight }}>
          <ul ref={containerRef} className={`radial-gallery-wheel is-mounted ${disabled ? 'is-disabled' : ''}`} dir={direction} style={{ width: circleDiameter, height: circleDiameter, bottom: -(circleDiameter * (1 - clampedVisibility)) }}>
            {childrenNodes.map((child, index) => {
              const angle = (index / childrenCount) * 2 * Math.PI;
              const x = Number((currentRadius * Math.cos(angle) * (direction === 'rtl' ? -1 : 1)).toFixed(3));
              const y = Number((currentRadius * Math.sin(angle)).toFixed(3));
              const rotation = Number((angle * 180 / Math.PI + 90).toFixed(3));
              const isHovered = hoveredIndex === index;
              const isDimmed = hoveredIndex !== null && !isHovered;
              return (
                <li key={index} ref={index === 0 ? childRef : null} className="radial-gallery-item" style={{ zIndex: isHovered ? 100 : 10, transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)` }}>
                  <div role="button" tabIndex={disabled ? -1 : 0} aria-label={itemLabels?.[index] ?? `Explore safety moment ${index + 1}`} onClick={() => !disabled && onItemSelect?.(index)} onKeyDown={(event) => { if (!disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onItemSelect?.(index); } }} onMouseEnter={() => !disabled && setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} onFocus={() => !disabled && setHoveredIndex(index)} onBlur={() => setHoveredIndex(null)} className={`radial-gallery-control ${isHovered ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}>
                    {child}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  },
);

RadialScrollGallery.displayName = 'RadialScrollGallery';
