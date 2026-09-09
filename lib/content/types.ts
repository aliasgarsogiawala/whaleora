export type Testimonial = { id: string; quote: string; name: string; detail: string; row: 1 | 2; visible: boolean; demo: boolean };
export type VideoReview = { id: string; title: string; product: string; slug: string; poster: string; video: string; duration: string; visible: boolean; demo: boolean };
export type ReviewContent = {
  testimonials: Testimonial[];
  videos: VideoReview[];
  settings: { writtenTitle: string; writtenSubtitle: string; videoTitle: string; videoSubtitle: string; showWritten: boolean; showVideos: boolean; marqueeSeconds: number };
};
export type ContentDocument = { revision: number; draft: ReviewContent; published: ReviewContent; updatedAt: string | null; publishedAt: string | null };

export function validateContent(input: unknown): ReviewContent {
  const record = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid content format.');
    return value as Record<string, unknown>;
  };
  const text = (value: unknown, label: string, max: number, required = true) => {
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error(`${label} ${required ? 'is required and' : ''} must be at most ${max} characters.`);
    return value.trim();
  };
  const flag = (value: unknown) => { if (typeof value !== 'boolean') throw new Error('Invalid visibility setting.'); return value; };
  const id = (value: unknown) => { const result = text(value, 'ID', 80); if (!/^[a-zA-Z0-9_-]+$/.test(result)) throw new Error('Invalid ID.'); return result; };
  const media = (value: unknown, label: string) => {
    const result = text(value, label, 2048);
    if (result.startsWith('/') && !result.startsWith('//') && !/[\\\s]/.test(result) && !result.includes('..')) return result;
    try { const url = new URL(result); if (url.protocol === 'https:' && !url.username && !url.password) return result; } catch { /* Report a field error below. */ }
    throw new Error(`${label} must be a local path or an HTTPS media URL.`);
  };
  const list = (value: unknown) => { if (!Array.isArray(value) || value.length > 40) throw new Error('Each section supports up to 40 reviews.'); return value; };
  const source = record(input);
  const settings = record(source.settings);
  const testimonials = list(source.testimonials).map((item): Testimonial => {
    const entry = record(item);
    if (entry.row !== 1 && entry.row !== 2) throw new Error('Choose marquee row 1 or 2.');
    return { id: id(entry.id), quote: text(entry.quote, 'Quote', 600), name: text(entry.name, 'Reviewer name', 80), detail: text(entry.detail, 'Product or detail', 100), row: entry.row, visible: flag(entry.visible), demo: flag(entry.demo) };
  });
  const videos = list(source.videos).map((item): VideoReview => {
    const entry = record(item);
    const slug = text(entry.slug, 'Product slug', 100);
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Product slug must contain lowercase letters, numbers or hyphens.');
    const duration = text(entry.duration, 'Duration', 8);
    if (!/^\d{1,3}:[0-5]\d$/.test(duration)) throw new Error('Use m:ss for video duration, for example 0:08.');
    return { id: id(entry.id), title: text(entry.title, 'Video title', 120), product: text(entry.product, 'Product name', 100), slug, poster: media(entry.poster, 'Poster image'), video: media(entry.video, 'Video'), duration, visible: flag(entry.visible), demo: flag(entry.demo) };
  });
  for (const entries of [testimonials, videos]) if (new Set(entries.map((item) => item.id)).size !== entries.length) throw new Error('Review IDs must be unique.');
  const seconds = settings.marqueeSeconds;
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 20 || seconds > 180) throw new Error('Marquee speed must be between 20 and 180 seconds.');
  return { testimonials, videos, settings: { writtenTitle: text(settings.writtenTitle, 'Written reviews heading', 160), writtenSubtitle: text(settings.writtenSubtitle, 'Written reviews description', 300, false), videoTitle: text(settings.videoTitle, 'Video reviews heading', 160), videoSubtitle: text(settings.videoSubtitle, 'Video reviews description', 300, false), showWritten: flag(settings.showWritten), showVideos: flag(settings.showVideos), marqueeSeconds: seconds } };
}
