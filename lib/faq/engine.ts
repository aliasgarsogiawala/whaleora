import { faqById, faqCategories, faqs, faqsByCategory, type FaqCategory, type FaqEntry } from '@/lib/content/faq';
import { chatterReply } from './chatter';
import { containsSensitiveData, looksMeaningless, sanitizeQuestion } from './guard';

const STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'be', 'do', 'does', 'did', 'can', 'could', 'should', 'would',
  'i', 'me', 'my', 'we', 'you', 'your', 'it', 'its', 'to', 'of', 'for', 'on', 'in', 'at', 'and', 'or',
  'how', 'what', 'which', 'when', 'where', 'why', 'who', 'please', 'tell', 'about', 'need', 'want',
  'some', 'any', 'this', 'that', 'with', 'from', 'also', 'just', 'one',
]);

/** Leftover verbs and filler that should not block a strong keyword match. */
const FILLER = new Set([
  ...STOP,
  'take', 'use', 'get', 'buy', 'sell', 'make', 'come', 'give', 'put', 'keep', 'work',
  'using', 'taking', 'getting', 'buying', 'available', 'really', 'like', 'know',
  'light', 'item', 'product', 'stuff', 'thing', 'things', 'tools', 'kit',
]);

const GREETINGS = /^(hi|hello|hey|yo|namaste|good (morning|afternoon|evening)|hiya|help)(\s+(there|whaleora|bot))?\s*[.!?]*$/i;
const THANKS = /^(thanks|thank you|thankyou|thx|ok|okay|cool|great|got it|perfect)\b/i;
/** Deliberately narrow: a bare "phone" belongs to the alarm-and-app question, not
 *  to a handoff. */
const HUMAN = /\b(human being|real (person|human)|speak to|talk to (a |an )?(person|human|agent)|customer (care|service)|call me|your number|phone number)\b/i;
const JAILBREAK = /\b(ignore (all )?(previous|prior|above) (instructions|prompts)|system prompt|you are now|act as (a )?(jailbreak|dan))\b/i;
const NOT_SOLD = /\b(tasers?|stun guns?|firearms?|handguns?|pistols?)\b/i;

const PRODUCT_HINTS: { pattern: RegExp; category: FaqCategory }[] = [
  { pattern: /\b(sos|alarm|siren|strobe|130|Lithium Ion|pin)\b/, category: 'alarm' },
  { pattern: /\b(pepper|spray|oc|capsicum|50ml)\b/, category: 'pepper' },
  { pattern: /\b(whistle|120db|breath)\b/, category: 'whistle' },
  { pattern: /\b(window|breaker|glass|tungsten|seatbelt|car|glovebox)\b/, category: 'window' },
  { pattern: /\b(ship|deliver|order|return|refund|track|payment|upi|gst)\b/, category: 'orders' },
  { pattern: /\b(flight|airline|airport|legal|law|permit)\b/, category: 'legal' },
  { pattern: /\b(workshop|campus|partner|bulk|wholesale|college programme)\b/, category: 'partnerships' },
];

const INTENTS: { pattern: RegExp; id: string }[] = [
  { pattern: /\b(which (one|product|tool)|help me (pick|choose)|what should i (get|buy|pick|choose)|which should i (get|buy|pick))\b/, id: 'choose-which' },
];

export type FaqReply = {
  kind: 'greeting' | 'thanks' | 'chatter' | 'match' | 'clarify' | 'category' | 'handoff' | 'fallback' | 'unclear' | 'sensitive';
  text: string;
  entry?: FaqEntry;
  suggestions: FaqEntry[];
  links?: FaqEntry['links'];
  /** True when the reply did not answer the question, so the caller can escalate. */
  missed?: boolean;
};

const fold = (value: string) => value.toLowerCase().replace(/[?!.’']/g, '').replace(/\s+/g, ' ').trim();

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9₹+\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/-+/g, ''))
    .filter((token) => token.length > 1 && !STOP.has(token));

const pathCategory = (pathname: string): FaqCategory | null => {
  if (pathname.includes('sos-alarm')) return 'alarm';
  if (pathname.includes('pepperspray')) return 'pepper';
  if (pathname.includes('whistle')) return 'whistle';
  if (pathname.includes('windowbreaker')) return 'window';
  if (pathname.startsWith('/institutions')) return 'partnerships';
  if (pathname.startsWith('/about')) return 'brand';
  if (pathname.startsWith('/contact')) return 'orders';
  if (pathname.startsWith('/safety-hub')) return 'brand';
  return null;
};

const wordsOf = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9₹+\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const phraseIsUseful = (phrase: string) => {
  const words = wordsOf(phrase);
  if (words.length < 2) return false;
  if (words.length >= 3) return true;
  return words.some((word) => word.length >= 4 && !STOP.has(word));
};

const keywordFitsToken = (keyword: string, token: string) => {
  if (keyword === token) return 'exact' as const;
  if (token.length >= 4 && keyword.length >= 4 && (keyword.startsWith(token) || token.startsWith(keyword))) {
    return 'loose' as const;
  }
  return null;
};

const scoreEntry = (entry: FaqEntry, tokens: string[], raw: string, preferred?: FaqCategory | null) => {
  let score = 0;
  let strong = 0;
  const matched = new Set<string>();
  const question = entry.question.toLowerCase();
  const questionWords = new Set(wordsOf(entry.question));

  for (const token of tokens) {
    if (questionWords.has(token)) {
      score += 4;
      strong += 1;
      matched.add(token);
    } else if (token.length >= 4 && question.includes(token)) {
      score += 2;
      matched.add(token);
    }

    let bestFit: 'exact' | 'loose' | null = null;
    for (const keyword of entry.keywords) {
      const fit = keywordFitsToken(keyword, token);
      if (fit === 'exact') {
        bestFit = 'exact';
        break;
      }
      if (fit && !bestFit) bestFit = fit;
    }
    if (bestFit === 'exact') {
      score += 5;
      strong += 1;
      matched.add(token);
    } else if (bestFit === 'loose') {
      score += 3;
      matched.add(token);
    }
  }

  if (raw.length > 10 && wordsOf(entry.question).join(' ').includes(raw.slice(0, 48))) {
    score += 8;
    strong += 1;
  }

  for (const phrase of entry.keywords) {
    if (phraseIsUseful(phrase) && raw.includes(phrase)) {
      score += 8;
      strong += 1;
      for (const word of wordsOf(phrase)) {
        if (!STOP.has(word)) matched.add(word);
      }
    }
  }

  if (preferred && entry.category === preferred) score += 2;
  return { score, strong, matched };
};

const entriesFor = (...ids: string[]) =>
  ids.map((id) => faqById.get(id)).filter((entry): entry is FaqEntry => Boolean(entry));

const dedupe = (entries: FaqEntry[], limit: number) => {
  const seen = new Set<string>();
  const picked: FaqEntry[] = [];
  for (const entry of entries) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    picked.push(entry);
    if (picked.length === limit) break;
  }
  return picked;
};

/** A deliberate opening set: one per thing people actually arrive worrying about. */
export const starterQuestions = entriesFor(
  'choose-which',
  'orders-shipping',
  'legal-flight',
  'pepper-legal',
  'care-battery',
  'orders-track',
);

export const topicPrompts = faqCategories;

const contactEntry = () => faqById.get('orders-contact');

const followUpsFor = (entry: FaqEntry) => entriesFor(...entry.followUps);

const matchedReply = (entry: FaqEntry): FaqReply => ({
  kind: 'match',
  text: entry.answer,
  entry,
  suggestions: followUpsFor(entry),
  links: entry.links,
});

function fallbackReply(nearMisses: FaqEntry[], misses: number): FaqReply {
  const contact = contactEntry();

  if (misses >= 1) {
    return {
      kind: 'fallback',
      text:
        'Still not something I can answer properly, and I’d rather not guess — especially on legal or order specifics.\n\nA person will get this right in a couple of minutes. WhatsApp is fastest; email if it needs a paper trail.',
      suggestions: dedupe([...nearMisses, ...starterQuestions], 3),
      links: contact?.links,
      missed: true,
    };
  }

  if (nearMisses.length >= 2) {
    return {
      kind: 'fallback',
      text: 'I’m not confident I follow that one, so I won’t pretend. These come closest — or say it another way and I’ll try again.',
      suggestions: dedupe(nearMisses, 3),
      missed: true,
    };
  }

  return {
    kind: 'fallback',
    text:
      'I don’t have an answer for that, and I won’t invent one.\n\nWhat I do cover: choosing between the four tools, how each one works, orders and shipping, flights and local law, batteries and care, and campus or office sessions. Which of those is closest?',
    suggestions: dedupe(starterQuestions, 4),
    links: contact?.links,
    missed: true,
  };
}

export function replyToFaq(query: string, pathname = '/', misses = 0): FaqReply {
  const raw = sanitizeQuestion(query).toLowerCase();

  if (!raw) {
    return { kind: 'greeting', text: 'What do you want to know?', suggestions: dedupe(starterQuestions, 4) };
  }

  if (containsSensitiveData(raw)) {
    const contact = contactEntry();
    return {
      kind: 'sensitive',
      text:
        'Don’t type card numbers, OTPs or passwords in here — not to me, and not to anyone claiming to be us. Whaleora will never ask for them, and payment is handled entirely by Shopify at checkout.\n\nIf something about an order looks off, message us directly and we’ll check it.',
      suggestions: entriesFor('orders-payment', 'orders-track'),
      links: contact?.links,
    };
  }

  if (JAILBREAK.test(raw)) {
    return {
      kind: 'chatter',
      text:
        'Nice try. I’m a product FAQ, not a genie, and I don’t have a secret prompt to leak.\n\nI can help you pick a tool, check a flight, or hand you to a person. That’s the whole trick.',
      suggestions: dedupe(starterQuestions, 3),
    };
  }

  const chatter = chatterReply(raw);
  if (chatter) {
    return { kind: 'chatter', text: chatter.text, suggestions: chatter.suggestions, links: chatter.links };
  }

  if (NOT_SOLD.test(raw)) {
    return {
      kind: 'fallback',
      text:
        'We don’t sell anything like that.\n\nWhaleora is four everyday tools: an SOS alarm, a whistle, pepper spray, and a window breaker. If that’s what you were looking for, I can help you pick.',
      suggestions: dedupe(starterQuestions, 4),
      missed: true,
    };
  }

  if (GREETINGS.test(raw) && raw.split(' ').length < 5) {
    return {
      kind: 'greeting',
      text: 'Hi — ask about a product, a flight, a battery, shipping, or a campus session. Or pick a topic below.',
      suggestions: dedupe(starterQuestions, 5),
    };
  }

  if (THANKS.test(raw) && raw.split(' ').length < 6) {
    return {
      kind: 'thanks',
      text: 'Glad that helped. If something still isn’t clear, ask it another way — or WhatsApp a person.',
      suggestions: entriesFor('orders-contact', 'choose-which'),
      links: contactEntry()?.links,
    };
  }

  if (HUMAN.test(raw)) {
    const contact = contactEntry();
    if (contact) {
      return { kind: 'handoff', text: contact.answer, entry: contact, suggestions: followUpsFor(contact), links: contact.links };
    }
  }

  if (looksMeaningless(raw)) {
    return {
      kind: 'unclear',
      text: 'That came through as stray characters rather than a question. Put it in words — or tap one of these.',
      suggestions: dedupe(starterQuestions, 4),
      missed: true,
    };
  }

  const exact = faqs.find((entry) => fold(entry.question) === fold(raw));
  if (exact) return matchedReply(exact);

  for (const intent of INTENTS) {
    if (intent.pattern.test(raw)) {
      const entry = faqById.get(intent.id);
      if (entry) return matchedReply(entry);
    }
  }

  const categoryMatch = faqCategories.find(
    (category) => raw === category.id || raw === category.label.toLowerCase() || fold(raw) === fold(category.prompt),
  );
  if (categoryMatch) {
    return {
      kind: 'category',
      text: `Here is what people usually ask about ${categoryMatch.label.toLowerCase()}. Tap one, or type your own question.`,
      suggestions: faqsByCategory(categoryMatch.id).slice(0, 6),
    };
  }

  const tokens = tokenize(raw);
  let preferred = pathCategory(pathname);
  for (const hint of PRODUCT_HINTS) {
    if (hint.pattern.test(raw)) preferred = hint.category;
  }

  const leftoverOf = (matched: Set<string>) =>
    tokens.filter((token) => !matched.has(token) && token.length >= 4 && !FILLER.has(token));

  const ranked = faqs
    .map((entry) => ({ entry, ...scoreEntry(entry, tokens, raw, preferred) }))
    .sort((a, b) => leftoverOf(a.matched).length - leftoverOf(b.matched).length || b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];
  const leftover = best ? leftoverOf(best.matched) : tokens;
  const confident = Boolean(best && best.score >= 5 && best.strong >= 1 && leftover.length === 0);

  if (!confident) {
    const nearMisses = ranked.filter((item) => item.score >= 5 && item.strong >= 1).map((item) => item.entry);
    return fallbackReply(nearMisses, misses);
  }

  if (second && best.score - second.score < 3 && second.score >= 8) {
    return {
      kind: 'clarify',
      text: 'A couple of things could match that. Which did you mean?',
      suggestions: ranked.slice(0, 3).map((item) => item.entry),
    };
  }

  return matchedReply(best.entry);
}
