export type Product = {
  id: string;
  slug: string;
  title: string;
  /** Product handle in Shopify admin. Defaults to `slug` when omitted. */
  shopifyHandle?: string;
  category: 'Alarms' | 'Tools';
  label: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  /** ISO currency for `price`. Shopify overrides this when the store is connected. */
  currencyCode?: string;
  images: string[];
  features: string[];
  specifications: { label: string; value: string }[];
  howItWorks: { title: string; text: string }[];
  scenarios: string[];
  included: string[];
  accent: string;
  /** Three headline figures for the 3D studio. */
  highlights: { value: string; label: string }[];
  /** Plain-language row data for the side-by-side chooser. */
  compare: {
    /** The one job it does. */
    job: string;
    /** When you'd actually reach for it. */
    reachFor: string;
    /** What powers it, if anything. */
    power: string;
    /** Where it lives when you're not using it. */
    carry: string;
    /** The honest caveat. */
    caveat: string;
  };
};

export const products: Product[] = [
  {
    id: 'sos-alarm',
    slug: 'sos-alarm',
    title: 'Personal SOS Alarm',
    category: 'Alarms',
    label: 'Acoustic defence',
    shortDescription: 'Pull the pin: 130dB siren and a strobe, until you put the pin back.',
    longDescription: 'Pull the pin and it does two things at once — a 130dB dual-siren and a strobe light. Push the pin back in and it stops. No app, no pairing, no charging.',
    price: 1799,
    images: ['/products/sos-alarm-mockup.webp', '/lifestyle/sos-alarm-flatlay.webp'],
    features: ['Pull-pin activation', 'Compact keychain format', 'Built-in strobe light', 'Weather-resistant casing'],
    specifications: [
      { label: 'Siren output', value: '130dB dual-siren' },
      { label: 'Lighting', value: 'Built-in emergency strobe LED' },
      { label: 'Battery', value: 'Replaceable CR2032 (included)' },
      { label: 'Build', value: 'Impact-resistant polymer' },
      { label: 'Weight', value: '38 grams' },
    ],
    howItWorks: [
      { title: 'Carry', text: 'Clip it where it stays within easy reach.' },
      { title: 'Pull', text: 'Remove the top pin to activate the siren and strobe.' },
      { title: 'Reset', text: 'Reinsert the pin to stop the alarm after use.' },
    ],
    scenarios: ['Campus', 'Commute', 'Travel', 'Evening walks'],
    included: ['Personal SOS Alarm', 'CR2032 battery', 'Keychain attachment'],
    accent: '#d7673d',
    highlights: [{ value: '130 dB', label: 'Dual siren' }, { value: '38 g', label: 'Carry weight' }, { value: 'CR2032', label: 'Swap it yourself' }],
    compare: {
      job: 'Makes noise you cannot ignore',
      reachFor: 'Someone is following you, or you need people to look up right now',
      power: 'CR2032 battery, included',
      carry: 'Keyring or bag strap',
      caveat: 'Noise draws attention. It does not stop anyone on its own.',
    },
  },
  {
    id: 'pepper-spray',
    slug: 'pepperspray',
    title: 'Pepper Spray',
    category: 'Tools',
    label: 'Self defence',
    shortDescription: '50ml stream spray, 8–10 feet of range, locking cap so it never goes off in your bag.',
    longDescription: 'A 50ml OC stream canister built for one-handed use, with a locking cap so it stays inert until you release it. Range is 8–10 feet.',
    price: 499,
    images: ['/products/pepper-spray-mockup.webp', '/products/pepper-spray-product.webp'],
    features: ['One-hand deployment', 'Protective safety lock', 'Stream spray format', 'Pocket-friendly canister'],
    specifications: [
      { label: 'Formula', value: 'Oleoresin Capsicum (OC) pepper formula' },
      { label: 'Capacity', value: '50ml' },
      { label: 'Range', value: 'Up to 8–10 feet' },
      { label: 'Safety', value: 'Protective locking cap' },
      { label: 'Build', value: 'Aluminium canister' },
      { label: 'Shelf life', value: 'Up to 3 years' },
    ],
    howItWorks: [
      { title: 'Carry', text: 'Keep it accessible, not buried at the bottom of a bag.' },
      { title: 'Unlock', text: 'Release the protective safety lock.' },
      { title: 'Direct', text: 'Follow the product instructions and move toward help.' },
    ],
    scenarios: ['Commute', 'Travel', 'Parking', 'Walking'],
    included: ['50ml Pepper Spray canister', 'Protective locking cap'],
    accent: '#8f351b',
    highlights: [{ value: '50 ml', label: 'Capacity' }, { value: '8–10 ft', label: 'Range' }, { value: '3 yr', label: 'Shelf life' }],
    compare: {
      job: 'Buys you distance and time',
      reachFor: 'Someone is already close and you need to get away',
      power: 'None. Shelf life up to 3 years',
      carry: 'Jacket pocket or outer bag pocket',
      caveat: 'Rules vary by state and by airline. Check before you travel with it.',
    },
  },
  {
    id: 'window-breaker',
    slug: 'windowbreaker',
    title: 'Emergency Window Breaker',
    category: 'Tools',
    label: 'Emergency escape tool',
    shortDescription: 'Spring-loaded tungsten point for car glass, plus a hidden blade for a stuck seatbelt.',
    longDescription: 'Two tools in 28 grams: a spring-loaded tungsten strike point for automotive glass, and a concealed stainless blade for a seatbelt that will not release.',
    price: 599,
    images: ['/products/window-breaker-mockup.webp'],
    features: ['Spring-loaded strike head', 'Tungsten steel point', 'Concealed seatbelt blade', 'Keyring-friendly format'],
    specifications: [
      { label: 'Mechanism', value: 'Spring-loaded high-impact strike head' },
      { label: 'Point', value: 'Tungsten steel' },
      { label: 'Cutter', value: 'Hidden stainless-steel seatbelt blade' },
      { label: 'Body', value: 'Lightweight ABS polymer' },
      { label: 'Weight', value: '28 grams' },
    ],
    howItWorks: [
      { title: 'Store', text: 'Keep it secured and within reach inside the vehicle.' },
      { title: 'Cut', text: 'Use the concealed blade for a jammed seatbelt.' },
      { title: 'Strike', text: 'Press the spring-loaded point against suitable automotive glass.' },
    ],
    scenarios: ['Road trips', 'Daily driving', 'Cab travel', 'Vehicle kits'],
    included: ['Emergency Window Breaker', 'Keyring attachment'],
    accent: '#748a83',
    highlights: [{ value: '28 g', label: 'Carry weight' }, { value: 'Tungsten', label: 'Strike point' }, { value: 'Hidden', label: 'Seatbelt blade' }],
    compare: {
      job: 'Gets you out of a car',
      reachFor: 'A seatbelt jams, or a door will not open after a crash',
      power: 'None. Mechanical spring',
      carry: 'Glovebox or door pocket — not your keyring',
      caveat: 'Works on tempered side glass. Windscreens are laminated and will not shatter.',
    },
  },
  {
    id: 'survival-whistle',
    slug: 'whistle',
    title: 'Survival Whistle',
    category: 'Tools',
    label: '120dB dual-tube design',
    shortDescription: '120dB from a 12g piece of aluminium. Nothing to charge, nothing to break.',
    longDescription: 'Twelve grams of aviation-grade aluminium with a dual-tube design that puts out 120dB on one breath. No battery, no electronics, nothing that can fail.',
    price: 299,
    images: ['/products/survival-whistle-mockup.webp', '/products/survival-whistle-ecom.webp', '/lifestyle/whistle-bag-shot.webp'],
    features: ['Breath activated', 'Dual-tube construction', 'Battery-free', 'Keychain and zipper attachment'],
    specifications: [
      { label: 'Volume output', value: '120dB dual-tube design' },
      { label: 'Material', value: 'Aviation-grade aluminium alloy' },
      { label: 'Power source', value: 'Battery-free / breath powered' },
      { label: 'Format', value: 'Keychain and zipper attachable' },
      { label: 'Weight', value: '12 grams' },
    ],
    howItWorks: [
      { title: 'Attach', text: 'Clip it to a bag, keyring or zipper within reach.' },
      { title: 'Blow', text: 'Use a firm breath to create a clear audible signal.' },
      { title: 'Repeat', text: 'Use repeated bursts to draw attention.' },
    ],
    scenarios: ['Travel', 'Outdoor walks', 'Campus', 'Emergency kits'],
    included: ['Survival Whistle', 'Attachment ring'],
    accent: '#102844',
    highlights: [{ value: '120 dB', label: 'Dual tube' }, { value: '12 g', label: 'Carry weight' }, { value: 'None', label: 'Battery needed' }],
    compare: {
      job: 'Signals for help with zero failure points',
      reachFor: 'You are lost, hurt, or out of phone battery',
      power: 'None. Your breath',
      carry: 'Keyring, zipper pull, or a kid’s school bag',
      caveat: 'Needs you conscious and able to breathe hard.',
    },
  },
];

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);

/** Shopify handle for a product, falling back to the URL slug. */
export const handleFor = (product: Pick<Product, 'slug' | 'shopifyHandle'>) => product.shopifyHandle ?? product.slug;

const localeFor = (currencyCode: string) => (currencyCode === 'INR' ? 'en-IN' : 'en-US');

export const formatPrice = (price: number, currencyCode = 'INR') =>
  new Intl.NumberFormat(localeFor(currencyCode), {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price);

