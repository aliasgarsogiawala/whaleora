import assert from 'node:assert/strict';
import test from 'node:test';
import { validateContent } from '../lib/content/types.ts';

const fixture = () => ({ testimonials: [{ id: 'one', quote: 'A useful little tool.', name: 'Sample reviewer', detail: 'Alarm', row: 1, visible: true, demo: true }], videos: [{ id: 'two', title: 'A closer look', product: 'Alarm', slug: 'sos-alarm', poster: '/products/example.webp', video: 'https://cdn.example.com/review.mp4', duration: '0:08', visible: true, demo: true }], settings: { writtenTitle: 'Written reviews', writtenSubtitle: '', videoTitle: 'Video reviews', videoSubtitle: '', showWritten: true, showVideos: true, marqueeSeconds: 65 } });

test('validates and trims content without retaining unknown fields', () => {
  const value = fixture(); value.testimonials[0].name = '  Sample  '; value.extra = 'discard';
  const result = validateContent(value); assert.equal(result.testimonials[0].name, 'Sample'); assert.equal(result.extra, undefined);
});
test('rejects unsafe media protocols, traversal and credential URLs', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', '//evil.example/video', '/a/../b', '/\\evil.example', 'https://user:pass@example.com/video']) {
    const value = fixture(); value.videos[0].video = url; assert.throws(() => validateContent(value), /HTTPS/);
  }
});
test('rejects duplicate IDs, invalid duration, row and flags', () => {
  const duplicate = fixture(); duplicate.testimonials.push(duplicate.testimonials[0]); assert.throws(() => validateContent(duplicate), /unique/);
  const duration = fixture(); duration.videos[0].duration = '0:99'; assert.throws(() => validateContent(duration), /m:ss/);
  const row = fixture(); row.testimonials[0].row = 3; assert.throws(() => validateContent(row), /row/);
  const flag = fixture(); flag.videos[0].visible = 'true'; assert.throws(() => validateContent(flag), /visibility/);
});
test('enforces lengths, limits and required content even for hidden reviews', () => {
  const empty = fixture(); empty.testimonials[0].visible = false; empty.testimonials[0].quote = ''; assert.throws(() => validateContent(empty), /Quote/);
  const tooLong = fixture(); tooLong.testimonials[0].quote = 'x'.repeat(601); assert.throws(() => validateContent(tooLong), /600/);
  const many = fixture(); many.testimonials = Array.from({ length: 41 }, (_, i) => ({ ...many.testimonials[0], id: String(i) })); assert.throws(() => validateContent(many), /40/);
  const speed = fixture(); speed.settings.marqueeSeconds = Infinity; assert.throws(() => validateContent(speed), /speed/);
});
test('supports empty sections and preserves visibility, demo and row settings', () => {
  const value = fixture(); value.testimonials = []; value.videos = []; value.settings.showWritten = false;
  assert.deepEqual(validateContent(value), value);
});
