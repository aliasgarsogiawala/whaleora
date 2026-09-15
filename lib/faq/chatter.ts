import { faqById, type FaqEntry, type FaqLink } from '@/lib/content/faq';

/** Playful / off-catalogue questions. These must not count as misses. */
export type ChatterHit = {
  text: string;
  suggestions: FaqEntry[];
  links?: FaqLink[];
};

const pick = (...ids: string[]) =>
  ids.map((id) => faqById.get(id)).filter((entry): entry is FaqEntry => Boolean(entry));

const LINES: { pattern: RegExp; text: string; ids?: string[] }[] = [
  {
    pattern: /\b(what(?:'s|s| is) your name|do you have a name|your name)\b/,
    text:
      'I don’t have a personal name. I’m the FAQ assistant on this site — Whaleora’s catalogue in chat form.\n\nCall me Whaleora if you want. I answer from what we actually sell: four tools, shipping, flights, care. A person is one tap away if you’d rather that.',
    ids: ['choose-which', 'brand-what', 'orders-contact'],
  },
  {
    pattern: /\bwho(?: are|'?re| r) (?:you|u)\b(?! (guys|people|all|selling|shipping))/,
    text:
      'A FAQ box, not a person. I match what you type to the catalogue — SOS alarm, whistle, pepper spray, window breaker, plus orders and travel rules.\n\nIf you meant the company: Whaleora is Sheuli’s, from Mumbai. “Your Safety. Our Priority.”',
    ids: ['brand-what', 'choose-which'],
  },
  {
    pattern: /\b(are you (an? )?(ai|bot|robot|chatgpt|llm|human|real|person)|are you (alive|sentient))\b/,
    text:
      'I’m a bot. A small one: I look up what Whaleora actually sells. Not ChatGPT, not a person on the other side of this box.\n\nFor a human, WhatsApp is the honest door.',
    ids: ['orders-contact', 'choose-which'],
  },
  {
    pattern: /^(hi|hey|hello|yo)?\s*(how are you|how'?s it going|how do you do|you good|you okay)\s*[.!?]*$/,
    text:
      'Steady. Same brief as yesterday: alarms, whistles, pepper spray, window breakers, and when they can go on a flight.\n\nWhat do you actually need?',
    ids: ['choose-which', 'legal-flight', 'orders-shipping'],
  },
  {
    pattern: /\b(how old are you|what(?:'s|s| is) your age|when were you (born|made))\b/,
    text:
      'I showed up with the site. Sheuli’s older — she started Whaleora in Mumbai after the only options were intimidating tactical gear or a pretty keychain that didn’t work.\n\nWant the story, or which tool to carry?',
    ids: ['brand-what', 'choose-which'],
  },
  {
    pattern: /\b(tell me a joke|make me laugh|say something funny|knock knock)\b/,
    text:
      'A safety brand walks into a bar. Nobody notices, which is the point.\n\nProduct version: the whistle never forgets its charger. It doesn’t have one. ₹299, lives on a zipper.',
    ids: ['whistle-how', 'choose-which'],
  },
  {
    pattern: /\b(favourite|favorite|which (one )?do you (like|prefer)|your (favourite|favorite) (product|one|tool))\b/,
    text:
      'The whistle. No battery to die, twelve grams, nothing to charge. Most people still start with the alarm because they want other people to look up.\n\nHonest pairing: alarm on the keys, whistle on the bag you actually carry.',
    ids: ['choose-alarm-vs-whistle', 'choose-kit'],
  },
  {
    pattern: /\b(love you|marry me|you'?re (cute|hot|pretty|beautiful)|be my (friend|girlfriend|boyfriend)|are you single)\b/,
    text:
      'I’m a text field. Flattered, and still going to talk about keyrings.\n\nThe SOS alarm is “single” until you pull the pin. Want help picking one?',
    ids: ['choose-which', 'alarm-how'],
  },
  {
    pattern: /\b(you('re| are) (stupid|dumb|useless|bad|wrong|broken)|this (bot|thing) (sucks|is (bad|useless|dumb)))\b/,
    text:
      'Okay. I still know the free-shipping line (₹1,499) and whether pepper spray can go in a cabin bag.\n\nAsk that, or WhatsApp a person — no hard feelings.',
    ids: ['orders-shipping', 'legal-flight', 'orders-contact'],
  },
  {
    pattern: /\b(sing|rap|poem|write (me )?a (poem|song|story)|tell me a story)\b/,
    text:
      'I don’t sing. I do 130dB, but that’s the alarm, not me.\n\nIf you want a short story: someone pulls a pin on a platform, the siren goes, heads turn, that’s the whole plot. Product question?',
    ids: ['alarm-how', 'choose-which'],
  },
  {
    pattern: /\b(what(?:'s|s| is) the weather|weather today|ipl score|cricket score|football score|horoscope|stock market)\b/,
    text:
      'Wrong window. I do four tools, shipping across India, and whether they can go on a flight.\n\nMumbai weather is Sheuli’s problem. What were you actually trying to ask?',
    ids: ['choose-which', 'orders-shipping', 'legal-flight'],
  },
  {
    pattern: /\b(what can you do|what do you (know|cover)|what are you for)\b/,
    text:
      'Choosing between the four tools, how each one works, prices, shipping and returns, flights and local law, batteries and care, campus or office sessions.\n\nI won’t invent the rest. If I miss twice, I’ll hand you to WhatsApp with your wording intact.',
    ids: ['choose-which', 'orders-shipping', 'legal-flight'],
  },
  {
    pattern: /^(bye|goodbye|see you|cya|gtg|that'?s all|ok bye)\b/,
    text: 'Go easy. The shop’s here if you need it — and WhatsApp if a person would be better.',
    ids: ['choose-which', 'orders-contact'],
  },
  {
    pattern: /^(test|testing|ping|hello bot|hi bot)\b/,
    text:
      'Here. Ask something real — which tool, a flight, a battery — or something silly. I can do both, as long as we end up useful.',
    ids: ['choose-which', 'legal-flight'],
  },
  {
    pattern: /\b(secret|hidden menu|easter egg|password)\b/,
    text:
      'No hidden menu. Four products, honest specs, free shipping over ₹1,499. If I’m stuck, a person reads the WhatsApp.',
    ids: ['choose-prices', 'orders-shipping', 'orders-contact'],
  },
  {
    pattern: /^(lol|lmao|haha|hehe|nice|wow|ok bot)\b/,
    text:
      'Ha. If you’re still here, ask the useful thing — which tool, a flight, or how it ships. I’ll stay in the bit.',
    ids: ['choose-which', 'legal-flight', 'orders-shipping'],
  },
];

export function chatterReply(raw: string): ChatterHit | null {
  for (const line of LINES) {
    if (line.pattern.test(raw)) {
      return { text: line.text, suggestions: pick(...(line.ids ?? ['choose-which'])) };
    }
  }
  return null;
}
