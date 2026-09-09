import { reviewVideos } from '@/data/review-videos';
import type { ContentDocument, ReviewContent } from './types';

export const defaultContent: ReviewContent = {
  settings: { writtenTitle: 'A few words from the everyday.', writtenSubtitle: '', videoTitle: 'A closer look.\nIn motion.', videoSubtitle: 'Scroll through the clips. Tap one to watch.', showWritten: true, showVideos: true, marqueeSeconds: 65 },
  videos: reviewVideos.map((video) => ({ ...video, visible: true, demo: true })),
  testimonials: [
    { quote: 'It lives next to my keys now. I don’t have to remember to pack it separately.', name: 'Aarohi S.', detail: 'Personal SOS Alarm' },
    { quote: 'I liked that I could understand it without sitting through a tutorial.', name: 'Riya M.', detail: 'Personal SOS Alarm' },
    { quote: 'Small enough for the side pocket I actually use, not the bottom of my bag.', name: 'Meera K.', detail: 'Pepper Spray' },
    { quote: 'No charging cable. No app. Just something useful on my keyring.', name: 'Dev P.', detail: 'Survival Whistle' },
    { quote: 'We picked a spot in the car for it, and made sure everyone knew where it was.', name: 'Kabir A.', detail: 'Window Breaker' },
    { quote: 'The simple design is what made me want to carry it every day.', name: 'Sana R.', detail: 'Personal SOS Alarm' },
    { quote: 'I clipped it to my travel bag before I packed anything else.', name: 'Neha D.', detail: 'Survival Whistle' },
    { quote: 'I came for one thing. The clear product details helped me choose the right one.', name: 'Ishaan V.', detail: 'Everyday essentials' },
  ].map((review, index) => ({ ...review, id: `testimonial-${index + 1}`, row: index < 4 ? 1 : 2, visible: true, demo: true })),
};

export function initialDocument(): ContentDocument {
  return { revision: 0, draft: structuredClone(defaultContent), published: structuredClone(defaultContent), updatedAt: null, publishedAt: null };
}
