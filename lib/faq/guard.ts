/** Input hardening for the FAQ assistant. Nothing here trusts the DOM attribute. */

export const MAX_QUESTION_LENGTH = 280;

const CONTROL = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g;
/** Zero-width joiners and bidi overrides can hide or reverse text inside a chat
 *  bubble, so they never survive into the thread. */
const INVISIBLE = /[\u00ad\u180e\u200b-\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff]/g;

export function sanitizeQuestion(value: unknown) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(CONTROL, ' ')
    .replace(INVISIBLE, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUESTION_LENGTH);
}

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'qwertyuiopasdfghjklzxcvbnm'];

/** Punctuation, emoji or keyboard-mashing — worth its own reply rather than a
 *  low-confidence guess. */
export function looksMeaningless(text: string) {
  const words = text.toLowerCase().match(/[a-z0-9₹]+/g);
  if (!words?.length) return true;
  const compact = text.replace(/\s+/g, '');
  if (/^(.)\1{4,}$/.test(compact)) return true;
  if (words.length === 1 && words[0].length >= 5 && KEY_ROWS.some((row) => row.includes(words[0]))) return true;
  return !words.some((word) => /\d/.test(word) || word.length <= 3 || /[aeiou]/.test(word));
}

const CREDENTIALS = /\b(cvv|cvc|otp|one[ -]?time password|upi pin|atm pin|card pin|passcode|password|expiry date|net ?banking login)\b/i;

/** Long separated digit runs read as card numbers. Ten-digit phone numbers and
 *  price figures stay below the threshold. */
const cardLike = (text: string) =>
  (text.match(/\d[\d -]{11,}\d/g) ?? []).some((run) => run.replace(/\D/g, '').length >= 13);

export const containsSensitiveData = (text: string) => CREDENTIALS.test(text) || cardLike(text);

/** Keeps card digits out of the rendered transcript even though it never leaves
 *  the browser. */
export const redactSensitive = (text: string) =>
  text.replace(/\d[\d -]{11,}\d/g, (run) => (run.replace(/\D/g, '').length >= 13 ? '•••• •••• •••• ••••' : run));

const SCHEMES = new Set(['https:', 'http:', 'mailto:', 'tel:']);

/** Allowlist for authored FAQ links, so a future content edit cannot introduce a
 *  `javascript:` target or a protocol-relative jump off-site. */
export function safeHref(href: string) {
  if (/^\/(?!\/)/.test(href) || href.startsWith('#')) return href;
  try {
    return SCHEMES.has(new URL(href).protocol) ? href : null;
  } catch {
    return null;
  }
}
