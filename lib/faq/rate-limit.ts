/** Flood control for the FAQ assistant.
 *
 *  The assistant answers entirely in the browser, so there is no endpoint to
 *  protect and no cost to an attacker. This caps what a stuck key, a scripted
 *  loop or an impatient shopper can do to the thread: bounded history, bounded
 *  work per second, and a visible cooldown instead of a frozen widget.
 */

const RULES = [
  { scope: 'burst', limit: 5, windowMs: 15_000 },
  { scope: 'session', limit: 40, windowMs: 600_000 },
] as const;

export type RateVerdict = { ok: true } | { ok: false; scope: (typeof RULES)[number]['scope']; retryAfterMs: number };

export type RateLimiter = () => RateVerdict;

const LONGEST = Math.max(...RULES.map((rule) => rule.windowMs));

export function createRateLimiter(clock: () => number = Date.now): RateLimiter {
  let hits: number[] = [];

  return function take() {
    const now = clock();
    hits = hits.filter((at) => now - at < LONGEST);

    for (const rule of RULES) {
      const oldest = hits.find((at) => now - at < rule.windowMs);
      const used = oldest === undefined ? 0 : hits.length - hits.indexOf(oldest);
      if (used >= rule.limit) {
        return { ok: false, scope: rule.scope, retryAfterMs: Math.max(1000, rule.windowMs - (now - oldest!)) };
      }
    }

    hits.push(now);
    return { ok: true };
  };
}

export const cooldownMessage = (verdict: Extract<RateVerdict, { ok: false }>) =>
  verdict.scope === 'burst'
    ? 'One at a time — give me a few seconds to catch up, then ask again.'
    : 'That is a lot of questions for one sitting, and I am clearly not landing them. WhatsApp a person instead; they will sort it faster than I will.';
