import { faqById, faqCategories, faqs, faqsByCategory, type FaqCategory, type FaqEntry } from '@/lib/content/faq';

const STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'be', 'do', 'does', 'did', 'can', 'could', 'should', 'would',
  'i', 'me', 'my', 'we', 'you', 'your', 'it', 'its', 'to', 'of', 'for', 'on', 'in', 'at', 'and', 'or',
  'how', 'what', 'which', 'when', 'where', 'why', 'who', 'please', 'tell', 'about', 'need', 'want',
  'some', 'any', 'this', 'that', 'with', 'from', 'also', 'just', 'one',
]);

const GREETINGS = /^(hi|hello|hey|yo|namaste|good (morning|afternoon|evening)|help|hiya)\b/i;
const THANKS = /^(thanks|thank you|thankyou|thx|ok|okay|cool|great|got it|perfect)\b/i;
const HUMAN = /\b(human|person|agent|someone real|talk to (a )?person|customer care|call me|phone)\b/i;

const PRODUCT_HINTS: { pattern: RegExp; category: FaqCategory }[] = [
  { pattern: /\b(sos|alarm|siren|strobe|130|cr2032|pin)\b/, category: 'alarm' },
  { pattern: /\b(pepper|spray|oc|capsicum|50ml)\b/, category: 'pepper' },
  { pattern: /\b(whistle|120db|breath)\b/, category: 'whistle' },
  { pattern: /\b(window|breaker|glass|tungsten|seatbelt|car|glovebox)\b/, category: 'window' },
  { pattern: /\b(ship|deliver|order|return|refund|track|payment|upi|gst)\b/, category: 'orders' },
  { pattern: /\b(flight|airline|airport|legal|law|permit)\b/, category: 'legal' },
  { pattern: /\b(workshop|campus|partner|bulk|wholesale|college programme)\b/, category: 'partnerships' },
];

export type FaqReply = {
  kind: 'greeting' | 'thanks' | 'match' | 'clarify' | 'category' | 'handoff' | 'fallback';
  text: string;
  entry?: FaqEntry;
  suggestions: FaqEntry[];
  links?: FaqEntry['links'];
};

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

const scoreEntry = (entry: FaqEntry, tokens: string[], raw: string, preferred?: FaqCategory | null) => {
  let score = 0;
  const question = entry.question.toLowerCase();
  const questionWords = new Set(wordsOf(entry.question));
  const keywordBlob = entry.keywords.join(' ');
  const hay = `${question} ${keywordBlob}`;

  for (const token of tokens) {
    let hit = false;
    if (questionWords.has(token)) {
      score += 4;
      hit = true;
    } else if (question.includes(token)) {
      score += 2;
      hit = true;
    }
    if (entry.keywords.some((keyword) => keyword === token)) {
      score += 5;
      hit = true;
    } else if (entry.keywords.some((keyword) => keyword.includes(token) || (token.length > 3 && token.includes(keyword)))) {
      score += 3;
      hit = true;
    } else if (!hit && hay.includes(token)) {
      score += 1;
    }
  }

  if (raw.length > 10 && wordsOf(entry.question).join(' ').includes(raw.slice(0, 48))) score += 8;

  for (const phrase of entry.keywords) {
    if (phrase.includes(' ') && raw.includes(phrase)) score += 8;
  }

  if (preferred && entry.category === preferred) score += 2;
  return score;
};

const followUpsFor = (entry: FaqEntry) =>
  entry.followUps.map((id) => faqById.get(id)).filter((item): item is FaqEntry => Boolean(item));

export function replyToFaq(query: string, pathname = '/'): FaqReply {
  const raw = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!raw) {
    return { kind: 'greeting', text: 'What do you want to know?', suggestions: faqs.filter((entry) => entry.featured).slice(0, 4) };
  }

  if (GREETINGS.test(raw) && raw.split(' ').length < 5) {
    return {
      kind: 'greeting',
      text: 'Hi — ask about a product, a flight, a battery, shipping, or a campus session. Or pick a topic below.',
      suggestions: faqs.filter((entry) => entry.featured).slice(0, 5),
    };
  }

  if (THANKS.test(raw) && raw.split(' ').length < 6) {
    return {
      kind: 'thanks',
      text: 'Glad that helped. If something still isn’t clear, ask it another way — or WhatsApp a person.',
      suggestions: [faqById.get('orders-contact'), faqById.get('choose-which')].filter((item): item is FaqEntry => Boolean(item)),
      links: faqById.get('orders-contact')?.links,
    };
  }

  if (HUMAN.test(raw)) {
    const contact = faqById.get('orders-contact')!;
    return { kind: 'handoff', text: contact.answer, entry: contact, suggestions: followUpsFor(contact), links: contact.links };
  }

  const categoryMatch = faqCategories.find((category) => raw === category.id || raw === category.label.toLowerCase() || raw === category.prompt.toLowerCase());
  if (categoryMatch) {
    const items = faqsByCategory(categoryMatch.id);
    return {
      kind: 'category',
      text: `Here is what people usually ask about ${categoryMatch.label.toLowerCase()}. Tap one, or type your own question.`,
      suggestions: items.slice(0, 6),
    };
  }

  const tokens = tokenize(raw);
  let preferred = pathCategory(pathname);
  for (const hint of PRODUCT_HINTS) {
    if (hint.pattern.test(raw)) preferred = hint.category;
  }

  const ranked = faqs
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens, raw, preferred) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];

  if (!best || best.score < 5) {
    const contact = faqById.get('orders-contact')!;
    return {
      kind: 'fallback',
      text: 'I don’t have a confident answer for that yet — and I’d rather not guess, especially on legal or order specifics. WhatsApp is fastest for a real person. Or try one of these.',
      suggestions: [
        faqById.get('choose-which')!,
        faqById.get('orders-shipping')!,
        faqById.get('legal-flight')!,
        contact,
      ],
      links: contact.links,
    };
  }

  if (second && best.score - second.score < 3 && second.score >= 8) {
    return {
      kind: 'clarify',
      text: 'A couple of things could match that. Which did you mean?',
      suggestions: ranked.slice(0, 3).map((item) => item.entry),
    };
  }

  return {
    kind: 'match',
    text: best.entry.answer,
    entry: best.entry,
    suggestions: followUpsFor(best.entry),
    links: best.entry.links,
  };
}

export const starterQuestions = faqs.filter((entry) => entry.featured).slice(0, 6);
export const topicPrompts = faqCategories;
