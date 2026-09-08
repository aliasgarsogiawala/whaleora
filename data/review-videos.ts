/** Placeholder footage only. Replace with permissioned customer reviews before launch. */
export const reviewVideos = [
  { id: 'alarm-everyday', title: 'Small enough for every day.', product: 'Personal SOS Alarm', slug: 'sos-alarm', poster: '/products/sos-alarm-mockup.webp', video: '/reviews/alarm-everyday.mp4', duration: '0:08' },
  { id: 'whistle-first-look', title: 'One less thing to charge.', product: 'Survival Whistle', slug: 'whistle', poster: '/products/survival-whistle-mockup.webp', video: '/reviews/whistle-first-look.mp4', duration: '0:08' },
  { id: 'spray-closeup', title: 'A closer look at the details.', product: 'Pepper Spray', slug: 'pepperspray', poster: '/products/pepper-spray-product.webp', video: '/reviews/spray-closeup.mp4', duration: '0:08' },
  { id: 'breaker-first-look', title: 'An essential for the car.', product: 'Window Breaker', slug: 'windowbreaker', poster: '/products/window-breaker-mockup.webp', video: '/reviews/breaker-first-look.mp4', duration: '0:08' },
  { id: 'alarm-in-the-bag', title: 'A place in the everyday kit.', product: 'Personal SOS Alarm', slug: 'sos-alarm', poster: '/lifestyle/sos-alarm-flatlay.webp', video: '/reviews/alarm-in-the-bag.mp4', duration: '0:08' },
  { id: 'whistle-on-the-go', title: 'Ready to come along.', product: 'Survival Whistle', slug: 'whistle', poster: '/lifestyle/whistle-bag-shot.webp', video: '/reviews/whistle-on-the-go.mp4', duration: '0:08' },
] as const;

export type ReviewVideo = (typeof reviewVideos)[number];
