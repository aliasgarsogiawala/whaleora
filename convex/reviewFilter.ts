/**
 * Words that hold a review back from publishing.
 *
 * This list is abuse and spam only, on purpose. Nothing here describes a
 * product being bad — "useless", "waste of money", "broke", "disappointed"
 * and the like all publish straight away. A filter that quietly swallowed
 * criticism would make the review section worthless to the people reading it.
 */
const PROFANITY = [
  'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'cunt', 'dick', 'whore',
  'slut', 'rape', 'retard', 'nigger', 'faggot', 'chutiya', 'madarchod',
  'bhenchod', 'behenchod', 'randi', 'gandu', 'harami',
];

const SPAM = [
  'click here', 'buy now', 'free money', 'make money', 'work from home',
  'crypto', 'bitcoin', 'casino', 'betting', 'loan approval', 'viagra',
  'whatsapp me', 'telegram me', 'dm me on', 'visit my', 'subscribe to my',
];

/** Anything that looks like a link or a harvested contact detail. */
const PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /\bwww\.[a-z0-9-]+\.[a-z]{2,}/i,
  /\b[a-z0-9-]+\.(com|net|org|in|co|io|shop|xyz|ru)\b/i,
  /\b\d{10,}\b/,
];

export type FilterVerdict = { blocked: boolean; reason?: string };

/** Collapses leetspeak and padding so "f.u.c.k" and "f u c k" still match. */
const flatten = (value: string) =>
  value
    .toLowerCase()
    .replace(/[0]/g, 'o').replace(/[1|]/g, 'i').replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a').replace(/[5$]/g, 's').replace(/[7]/g, 't')
    .replace(/[^a-z]/g, '');

export function screenReview(text: string): FilterVerdict {
  const raw = text.toLowerCase();
  const flat = flatten(text);

  for (const word of PROFANITY) {
    if (flat.includes(flatten(word))) return { blocked: true, reason: 'language' };
  }
  for (const phrase of SPAM) {
    if (raw.includes(phrase)) return { blocked: true, reason: 'spam' };
  }
  for (const pattern of PATTERNS) {
    if (pattern.test(text)) return { blocked: true, reason: 'link' };
  }
  return { blocked: false };
}
