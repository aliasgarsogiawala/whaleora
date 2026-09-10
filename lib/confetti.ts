/**
 * A small canvas confetti burst, in Whaleora's palette.
 *
 * Deliberately dependency-free: one shared canvas is created on the first
 * burst, sits above the cart drawer, and removes itself once the last particle
 * has fallen. Honours prefers-reduced-motion by doing nothing at all.
 */

const COLORS = ['#d7673d', '#ddbb98', '#748a83', '#efcdb1', '#f8ecde', '#0a1b2f'];

const GRAVITY = 0.34;
const DRAG = 0.986;
const CANVAS_Z = 300;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  age: number;
  ttl: number;
  round: boolean;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let frame = 0;

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function sizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function teardown() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  particles = [];
  window.removeEventListener('resize', sizeCanvas);
  canvas?.remove();
  canvas = null;
  ctx = null;
}

function ensureCanvas() {
  if (canvas && ctx) return true;
  const element = document.createElement('canvas');
  element.setAttribute('aria-hidden', 'true');
  Object.assign(element.style, {
    position: 'fixed',
    inset: '0',
    zIndex: String(CANVAS_Z),
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  const context = element.getContext('2d');
  if (!context) return false;
  canvas = element;
  ctx = context;
  document.body.appendChild(element);
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  return true;
}

function tick() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((particle) => {
    particle.age += 1;
    particle.vx *= DRAG;
    particle.vy = particle.vy * DRAG + GRAVITY;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.spin;

    if (particle.age > particle.ttl || particle.y - particle.size > window.innerHeight) return false;

    const fade = Math.min(1, (particle.ttl - particle.age) / 22);
    ctx!.save();
    ctx!.globalAlpha = Math.max(0, fade);
    ctx!.translate(particle.x, particle.y);
    ctx!.rotate(particle.rotation);
    ctx!.fillStyle = particle.color;
    if (particle.round) {
      ctx!.beginPath();
      ctx!.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      ctx!.fill();
    } else {
      // Squash the height as it spins, so flat pieces read as tumbling paper.
      ctx!.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
    }
    ctx!.restore();
    return true;
  });

  if (!particles.length) {
    teardown();
    return;
  }
  frame = requestAnimationFrame(tick);
}

/** Fire a burst from a point in viewport coordinates. */
export function burstConfetti(x: number, y: number, count = 64) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;
  if (!ensureCanvas()) return;

  for (let i = 0; i < count; i += 1) {
    // Fan upward and outward rather than a full circle — a downward spray
    // under the cursor just looks like the button leaked.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
    const speed = 5.5 + Math.random() * 8.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 7,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.34,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      age: 0,
      ttl: 78 + Math.random() * 52,
      round: Math.random() < 0.22,
    });
  }

  if (!frame) frame = requestAnimationFrame(tick);
}
