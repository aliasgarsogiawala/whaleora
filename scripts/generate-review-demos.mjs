// Silent product-photo animations for the placeholder review gallery.
// Run from the project root: node scripts/generate-review-demos.mjs
import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const clips = [
  ['alarm-everyday', 'products/sos-alarm-mockup.webp', 'Personal SOS Alarm', 'A compact everyday companion'],
  ['whistle-first-look', 'products/survival-whistle-mockup.webp', 'Survival Whistle', 'No battery. No charging.'],
  ['spray-closeup', 'products/pepper-spray-product.webp', 'Pepper Spray', 'A closer look at the details'],
  ['breaker-first-look', 'products/window-breaker-mockup.webp', 'Window Breaker', 'An essential for the car'],
  ['alarm-in-the-bag', 'lifestyle/sos-alarm-flatlay.webp', 'Personal SOS Alarm', 'A place in the everyday kit'],
  ['whistle-on-the-go', 'lifestyle/whistle-bag-shot.webp', 'Survival Whistle', 'Ready to come along'],
];
const output = resolve('public/reviews');
mkdirSync(output, { recursive: true });

for (const [id, photo, title, caption] of clips) {
  const filters = [
    'scale=900:1600:force_original_aspect_ratio=increase',
    'crop=900:1600',
    "zoompan=z='1.04+0.045*sin(on/192*PI)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=192:s=540x960:fps=24",
    'drawbox=x=0:y=0:w=iw:h=85:color=0x0a1b2f@0.75:t=fill',
    'drawbox=x=0:y=720:w=iw:h=240:color=0x0a1b2f@0.86:t=fill',
    "drawtext=text='WHALEORA  /  DEMO REVIEW':fontcolor=0xf8ecde:fontsize=20:x=30:y=32",
    `drawtext=text='${title}':fontcolor=0xf8ecde:fontsize=32:x=30:y=756`,
    `drawtext=text='${caption}':fontcolor=0xddbb98:fontsize=22:x=30:y=812:enable='gte(t,2)'`,
    "drawtext=text='Sample clip - not a customer testimonial':fontcolor=0xf8ecde:fontsize=16:x=30:y=911",
    'drawbox=x=30:y=875:w=480:h=2:color=0xddbb98@0.3:t=fill',
    'fade=t=in:st=0:d=0.35',
    'fade=t=out:st=7.65:d=0.35',
    'format=yuv420p',
  ];
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', resolve('public', photo), '-vf', filters.join(','), '-t', '8', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-movflags', '+faststart', resolve(output, `${id}.mp4`)], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`Created ${id}.mp4`);
}
