export type Product = {
  id: string;
  slug: string;
  title: string;
  category: 'Alarms' | 'Tools';
  label: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  images: string[];
  features: string[];
  specifications: { label: string; value: string }[];
  howItWorks: { title: string; text: string }[];
  scenarios: string[];
  included: string[];
  accent: string;
};

export const products: Product[] = [
  {
    id: 'sos-alarm',
    slug: 'sos-alarm',
    title: 'Personal SOS Alarm',
    category: 'Alarms',
    label: 'Acoustic defence',
    shortDescription: 'A compact dual-siren alarm with strobe light and pull-pin activation.',
    longDescription: 'Designed to draw attention when activated, in a minimal keychain format that fits naturally into everyday carry.',
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
  },
  {
    id: 'pepper-spray',
    slug: 'pepperspray',
    title: 'Pepper Spray',
    category: 'Tools',
    label: 'Self defence',
    shortDescription: 'A compact 50ml stream spray with a protective locking cap.',
    longDescription: 'A quick-release personal-safety tool designed for one-hand deployment and convenient bag or pocket carry.',
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
  },
  {
    id: 'window-breaker',
    slug: 'windowbreaker',
    title: 'Emergency Window Breaker',
    category: 'Tools',
    label: 'Emergency escape tool',
    shortDescription: 'A compact spring-loaded glass breaker with a concealed seatbelt cutter.',
    longDescription: 'Designed for vehicle emergency preparedness with a tungsten strike point and a hidden stainless-steel blade.',
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
  },
  {
    id: 'survival-whistle',
    slug: 'whistle',
    title: 'Survival Whistle',
    category: 'Tools',
    label: '120dB dual-tube design',
    shortDescription: 'A battery-free aluminium whistle designed to create a strong audible signal.',
    longDescription: 'An ultra-lightweight, weather-resistant signal tool for everyday bags, travel and outdoor preparedness.',
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
  },
];

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
export const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
