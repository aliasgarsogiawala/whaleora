import { whatsappHref } from './contact';

export type FaqCategory =
  | 'choose'
  | 'alarm'
  | 'pepper'
  | 'whistle'
  | 'window'
  | 'orders'
  | 'legal'
  | 'care'
  | 'partnerships'
  | 'brand';

export type FaqLink = { label: string; href: string };

export type FaqEntry = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  keywords: string[];
  followUps: string[];
  links?: FaqLink[];
  featured?: boolean;
};

export const faqCategories: { id: FaqCategory; label: string; prompt: string }[] = [
  { id: 'choose', label: 'Which tool', prompt: 'Help me pick the right one' },
  { id: 'alarm', label: 'SOS Alarm', prompt: 'How the 130dB alarm works' },
  { id: 'pepper', label: 'Pepper spray', prompt: 'Is pepper spray legal to carry?' },
  { id: 'whistle', label: 'Whistle', prompt: 'Tell me about the survival whistle' },
  { id: 'window', label: 'Window breaker', prompt: 'How does the window breaker work?' },
  { id: 'orders', label: 'Orders', prompt: 'Shipping, returns and payments' },
  { id: 'legal', label: 'Travel & law', prompt: 'Can I take these on a flight?' },
  { id: 'care', label: 'Care', prompt: 'Battery, testing and storage' },
  { id: 'partnerships', label: 'Partnerships', prompt: 'Workshops for campuses and offices' },
  { id: 'brand', label: 'Whaleora', prompt: 'Who makes these, and why' },
];

export const faqs: FaqEntry[] = [
  {
    id: 'choose-which',
    category: 'choose',
    featured: true,
    question: 'Which product should I buy?',
    answer:
      'Pick by the situation, not the catalogue.\n\nReach for the Personal SOS Alarm (₹1,799) when you need people nearby to look up right now — 130dB siren and a strobe on one pull. Take pepper spray (₹499) when someone is already close and you need distance. The Survival Whistle (₹299) is the fail-safe: no battery, 120dB, lives on a zipper. The window breaker (₹599) belongs in a car, not on a keyring.\n\nMost people start with the alarm and add the whistle. Tell me where you spend your days — campus, commute, travel, driving — and I’ll narrow it.',
    keywords: ['which', 'choose', 'pick', 'recommend', 'best', 'right one', 'should i buy', 'starter', 'begin', 'first', 'kit', 'compare', 'difference', 'vs', 'versus', 'help me choose'],
    followUps: ['choose-alarm-vs-whistle', 'choose-kit', 'alarm-how', 'orders-shipping'],
    links: [
      { label: 'Compare all four', href: '/products' },
      { label: 'Start with the SOS Alarm', href: '/products/sos-alarm' },
    ],
  },
  {
    id: 'choose-alarm-vs-whistle',
    category: 'choose',
    question: 'What’s the difference between the alarm and the whistle?',
    answer:
      'Same job — make noise — different failure modes.\n\nThe SOS Alarm is louder (130dB vs 120dB), adds a strobe, and runs until you push the pin back in. It needs a CR2032 coin cell, which is included and replaceable.\n\nThe whistle needs nothing except your breath. Twelve grams, aviation-grade aluminium, nothing to charge or break. That’s why we sell them together: the alarm for when you can pull a pin; the whistle for when the battery is dead, the electronics fail, or you just want a second, silent-until-needed signal on a bag zip.',
    keywords: ['alarm vs whistle', 'difference', 'compare alarm', 'siren vs whistle', 'both', 'instead'],
    followUps: ['choose-kit', 'alarm-how', 'whistle-how', 'care-battery'],
    links: [
      { label: 'Personal SOS Alarm', href: '/products/sos-alarm' },
      { label: 'Survival Whistle', href: '/products/whistle' },
    ],
  },
  {
    id: 'choose-kit',
    category: 'choose',
    question: 'Should I buy more than one?',
    answer:
      'A useful pairing is the SOS Alarm on your keys and the whistle on the bag you actually carry. That covers a dead battery and a bag you left on a chair.\n\nAdd pepper spray only if you will keep it in an outer pocket — not the bottom of a tote — and you’ve checked the rules where you live. Add the window breaker only if you drive, and put it in the car, not on the keyring.\n\nOrders over ₹1,499 ship free across India. Alarm + whistle is ₹2,098. Alarm + whistle + window breaker is ₹2,697.',
    keywords: ['kit', 'bundle', 'combo', 'together', 'more than one', 'pair', 'set', 'collection', 'all four', 'gift'],
    followUps: ['orders-shipping', 'choose-which', 'window-where'],
    links: [{ label: 'Shop the collection', href: '/products' }],
  },
  {
    id: 'choose-student',
    category: 'choose',
    question: 'What should a student carry?',
    answer:
      'Campus days usually want the SOS Alarm on a keyring or lanyard, plus the whistle on the bag that goes to late labs and the library. Neither needs an app, and both work when the phone is dead.\n\nPepper spray is a personal decision — check hostel and campus rules before you buy, and never pack it for a flight home. We also run orientation-week sessions for universities if that’s more useful than a product on its own.',
    keywords: ['student', 'campus', 'college', 'hostel', 'university', 'library', 'late class', 'daughter', 'son', 'teen', 'first year'],
    followUps: ['alarm-how', 'whistle-how', 'legal-pepper', 'partnerships-campus'],
    links: [
      { label: 'SOS Alarm', href: '/products/sos-alarm' },
      { label: 'Campus programmes', href: '/institutions' },
    ],
  },
  {
    id: 'choose-commute',
    category: 'choose',
    question: 'What should I carry on a commute?',
    answer:
      'If the worry is a poorly lit walk, a late local, or a parking lot, start with the SOS Alarm. Clip it where you can pull the pin without digging. 130dB is in the range of a smoke alarm at arm’s length — enough that people look up.\n\nPepper spray only helps if it is already in your hand or an outer pocket. Buried in a bag, it is jewellery. The whistle is the backup that cannot run out of charge on a long day.',
    keywords: ['commute', 'metro', 'local', 'bus', 'walk', 'evening', 'night', 'parking', 'office', 'late'],
    followUps: ['alarm-does-it-stop', 'pepper-how', 'choose-kit'],
    links: [{ label: 'Personal SOS Alarm', href: '/products/sos-alarm' }],
  },
  {
    id: 'choose-driver',
    category: 'choose',
    question: 'What should I keep in the car?',
    answer:
      'The Emergency Window Breaker. 28 grams, spring-loaded tungsten point for tempered side glass, and a hidden stainless blade for a seatbelt that will not release. Keep it in a door pocket or the glovebox — somewhere a belted person can reach.\n\nIt will not shatter a laminated windscreen. That is by design of the glass, not a defect in the tool. It is a car tool, not a keyring tool, and it does not belong in cabin baggage.',
    keywords: ['car', 'drive', 'driving', 'vehicle', 'cab', 'taxi', 'road trip', 'glovebox', 'accident', 'crash', 'seatbelt'],
    followUps: ['window-how', 'window-glass', 'legal-flight'],
    links: [{ label: 'Emergency Window Breaker', href: '/products/windowbreaker' }],
  },
  {
    id: 'choose-prices',
    category: 'choose',
    featured: true,
    question: 'How much do they cost?',
    answer:
      'Four objects, ₹299 to ₹1,799.\n\nSurvival Whistle — ₹299\nPepper Spray — ₹499\nEmergency Window Breaker — ₹599\nPersonal SOS Alarm — ₹1,799\n\nTaxes are included. Free shipping across India on orders over ₹1,499. There is no subscription, no app, and no “pro” tier.',
    keywords: ['price', 'cost', 'how much', '₹', 'rupee', 'expensive', 'cheap', 'afford', '299', '499', '599', '1799', 'subscription'],
    followUps: ['choose-cheap-alarm', 'orders-shipping', 'choose-which'],
    links: [{ label: 'See all four', href: '/products' }],
  },
  {
    id: 'choose-cheap-alarm',
    category: 'choose',
    question: 'Why not a ₹99 alarm from a marketplace?',
    answer:
      'Plenty of cheap alarms are labelled 130dB and deliver nothing close. Ours lists the things you can hold us to: output, weight (38g), cell type (CR2032), and build. If a unit doesn’t hold up, email hello@whaleora.com — you don’t have to build a case first.\n\nWe’d rather be compared on those numbers than on a discount badge.',
    keywords: ['cheap', 'amazon', 'flipkart', '99', 'duplicate', 'fake', 'why whaleora', 'quality', 'rated'],
    followUps: ['alarm-loud', 'orders-faulty', 'choose-prices'],
    links: [{ label: 'SOS Alarm specs', href: '/products/sos-alarm' }],
  },
  {
    id: 'alarm-how',
    category: 'alarm',
    featured: true,
    question: 'How does the Personal SOS Alarm work?',
    answer:
      'Three seconds to learn.\n\nCarry — clip it to a keyring or bag strap, somewhere you can reach without looking.\nPull — yank the top pin. A 130dB dual-siren and a strobe start immediately and stay on.\nReset — push the pin back in to stop it. Nothing to reconfigure afterwards.\n\nNo app, no pairing, no charging. If you can pull a keyring apart, you already know how to use it.',
    keywords: ['how it works', 'how to use', 'pull pin', 'activate', 'reset', 'siren', 'strobe', 'instructions', 'operate', 'sos alarm'],
    followUps: ['alarm-loud', 'care-battery', 'alarm-does-it-stop'],
    links: [{ label: 'Personal SOS Alarm', href: '/products/sos-alarm' }],
  },
  {
    id: 'alarm-loud',
    category: 'alarm',
    featured: true,
    question: 'How loud is 130dB, really?',
    answer:
      'Loud enough that people in the street look up, which is the entire point. For reference, it is in the range of a smoke alarm held at arm’s length.\n\nThe published spec is a 130dB dual-siren on the Personal SOS Alarm, plus a strobe so it is visible as well as audible. The Survival Whistle is 120dB — still very loud, from one breath and no battery.',
    keywords: ['loud', '130', '130db', '120db', 'decibel', 'volume', 'noise', 'sound', 'smoke alarm', 'hear', 'how loud'],
    followUps: ['alarm-does-it-stop', 'whistle-how', 'care-test'],
    links: [{ label: 'Personal SOS Alarm', href: '/products/sos-alarm' }],
  },
  {
    id: 'alarm-does-it-stop',
    category: 'alarm',
    question: 'Does a personal alarm actually stop anyone?',
    answer:
      'No, and we won’t pretend otherwise. What 130dB does is remove the thing most situations depend on: privacy. It makes people look up and it buys you seconds to move. Seconds are usually the whole game.\n\nIt is acoustic defence, not a weapon. If you need distance rather than attention, that is what pepper spray is for — with the honest caveats that come with it.',
    keywords: ['stop', 'attacker', 'protect', 'defence', 'defense', 'effective', 'work', 'does it help', 'safety', 'weapon'],
    followUps: ['pepper-how', 'choose-which', 'alarm-how'],
    links: [{ label: 'Read the honest caveats', href: '/#chooser' }],
  },
  {
    id: 'alarm-weight',
    category: 'alarm',
    question: 'How big is the SOS Alarm?',
    answer:
      '38 grams, impact-resistant polymer, compact keychain format. It is meant to live next to your keys, not in a drawer.\n\nIn the box: the alarm, a CR2032 battery, and a keychain attachment. Weather-resistant casing — rain on a commute is fine; it is not a dive watch.',
    keywords: ['weight', 'size', '38g', '38 grams', 'small', 'keyring', 'keychain', 'compact', 'dimensions', 'weather', 'waterproof', 'rain'],
    followUps: ['care-battery', 'alarm-how', 'choose-kit'],
    links: [{ label: 'Personal SOS Alarm', href: '/products/sos-alarm' }],
  },
  {
    id: 'alarm-app',
    category: 'alarm',
    question: 'Does it need an app or Bluetooth?',
    answer:
      'No. No pairing, no firmware, no account, no subscription. Pull the pin; that is the entire interface.\n\nAnything you have to unlock or remember is one step too many when you actually need it. That is why we don’t make a “smart” version.',
    keywords: ['app', 'bluetooth', 'wifi', 'pair', 'smartphone', 'gps', 'location', 'subscription', 'charge', 'usb', 'smart'],
    followUps: ['care-battery', 'alarm-how', 'choose-cheap-alarm'],
  },
  {
    id: 'pepper-legal',
    category: 'pepper',
    featured: true,
    question: 'Is pepper spray legal to carry in India?',
    answer:
      'Our current guidance is that Whaleora’s everyday tools are legal to carry in most jurisdictions in India. Rules genuinely do vary — pepper spray most of all — so check what applies where you live and where you’re travelling. Airlines, campuses, courts and some venues have their own lists.\n\nWe’d rather lose the sale than have you find out at a security desk. If you are unsure, skip the spray and carry the alarm and whistle, which are acoustic tools, not chemical ones.',
    keywords: ['legal', 'law', 'india', 'allowed', 'permit', 'licence', 'license', 'illegal', 'police', 'state', 'carry pepper', 'oc spray'],
    followUps: ['legal-flight', 'pepper-how', 'choose-which'],
    links: [{ label: 'Pepper Spray', href: '/products/pepperspray' }],
  },
  {
    id: 'pepper-how',
    category: 'pepper',
    question: 'How does the pepper spray work?',
    answer:
      'A 50ml oleoresin capsicum (OC) stream canister for one-handed use, with a locking cap so it stays inert in a bag. Range is 8–10 feet.\n\nCarry it accessible — jacket or outer pocket, not the bottom of a tote. Unlock the protective cap, direct the stream, and move toward help. It buys distance and time; it does not end a situation on its own.\n\nShelf life is up to 3 years. Note the date when it arrives.',
    keywords: ['pepper', 'spray', 'oc', 'oleoresin', 'capsicum', '50ml', 'range', 'lock', 'how to spray', 'stream', 'use spray'],
    followUps: ['pepper-legal', 'pepper-shelf', 'legal-flight'],
    links: [{ label: 'Pepper Spray', href: '/products/pepperspray' }],
  },
  {
    id: 'pepper-shelf',
    category: 'pepper',
    question: 'How long does pepper spray last?',
    answer:
      'Up to three years unopened, stored out of direct sun and not in a baking car. Heat and age both weaken the formula.\n\nWhen it expires, don’t throw the canister in household waste — check your local rules for aerosols, or email us and we’ll tell you what we recommend. We don’t currently run a formal take-back, but we’ll help you dispose of it properly.',
    keywords: ['expiry', 'expire', 'shelf', '3 years', 'old', 'replace spray', 'heat', 'store pepper'],
    followUps: ['care-storage', 'pepper-how', 'orders-faulty'],
  },
  {
    id: 'whistle-how',
    category: 'whistle',
    question: 'How does the Survival Whistle work?',
    answer:
      'Twelve grams of aviation-grade aluminium. Dual-tube design, 120dB on one firm breath. Clip it to a keyring, zipper or school bag, blow, and use repeated bursts if you need people to keep looking.\n\nNo battery, no electronics, nothing that can fail except you being unable to breathe hard. That caveat is why it sits beside the alarm, not instead of it.',
    keywords: ['whistle', '120db', 'aluminium', 'aluminum', 'dual tube', 'breath', 'blow', '12g', 'zipper', 'signal'],
    followUps: ['choose-alarm-vs-whistle', 'legal-flight', 'choose-student'],
    links: [{ label: 'Survival Whistle', href: '/products/whistle' }],
  },
  {
    id: 'whistle-kids',
    category: 'whistle',
    question: 'Is the whistle suitable for children?',
    answer:
      'Yes, as a signalling tool — on a zipper pull or school bag, with a conversation about when to use it (lost, hurt, or cannot find you), not as a toy. It needs the child to be conscious and able to blow hard.\n\nIt is not a substitute for supervision, and it is not a weapon. For older students living in hostels, the SOS Alarm is usually the more useful everyday carry.',
    keywords: ['child', 'kid', 'children', 'school', 'daughter', 'son', 'family', 'age', 'kids'],
    followUps: ['whistle-how', 'choose-student', 'brand-hub'],
    links: [{ label: 'Family guides', href: '/safety-hub' }],
  },
  {
    id: 'window-how',
    category: 'window',
    question: 'How does the window breaker work?',
    answer:
      'Two tools in 28 grams.\n\nStore it inside the vehicle, within reach of a belted person. If a seatbelt jams, use the concealed stainless blade. If a door will not open, press the spring-loaded tungsten point against suitable automotive side glass.\n\nIt is mechanical — no battery. Practise finding it with your eyes closed once, then leave it alone.',
    keywords: ['window breaker', 'glass breaker', 'tungsten', 'spring', 'strike', 'cutter', 'seatbelt cutter', 'escape', 'how to break'],
    followUps: ['window-glass', 'window-where', 'legal-flight'],
    links: [{ label: 'Emergency Window Breaker', href: '/products/windowbreaker' }],
  },
  {
    id: 'window-glass',
    category: 'window',
    question: 'Will it break any car window?',
    answer:
      'No. It is built for tempered side and rear glass, which is designed to shatter. Windscreens are laminated — two sheets with a plastic interlayer — and will not explode into beads. Don’t spend the seconds you have on the windscreen.\n\nSide window, low in the corner, then get out. That is the whole method.',
    keywords: ['windscreen', 'windshield', 'laminated', 'tempered', 'side glass', 'rear', 'shatter', 'won’t break', 'which window'],
    followUps: ['window-how', 'window-where', 'choose-driver'],
  },
  {
    id: 'window-where',
    category: 'window',
    question: 'Where should I keep the window breaker?',
    answer:
      'Glovebox or door pocket — not your keyring. On a keyring it is a sharp tool walking through security, and it will not be in the car when you need it.\n\nPick one place, tell everyone who drives the car, and leave it there. A tool you cannot reach while belted is decoration.',
    keywords: ['where to keep', 'glovebox', 'door pocket', 'keyring', 'store breaker', 'car kit'],
    followUps: ['window-how', 'legal-flight', 'choose-driver'],
  },
  {
    id: 'orders-shipping',
    category: 'orders',
    featured: true,
    question: 'How much is shipping, and where do you deliver?',
    answer:
      'Free shipping on orders over ₹1,499 across India. Below that, shipping charges and the delivery estimate for your pincode are shown at checkout. Taxes are included in the listed prices.\n\nWe ship from Maharashtra. We do not currently publish a single pan-India delivery day because it depends on your pincode — checkout is the honest number.',
    keywords: ['shipping', 'delivery', 'free shipping', '1499', 'pincode', 'india', 'dispatch', 'how long', 'days', 'courier', 'deliver'],
    followUps: ['orders-track', 'orders-payment', 'choose-prices'],
    links: [{ label: 'Shop the collection', href: '/products' }],
  },
  {
    id: 'orders-track',
    category: 'orders',
    question: 'How do I track or change an order?',
    answer:
      'WhatsApp is fastest for a status, an address change, or a missing parcel — message us with your name and order email. You can also write to hello@whaleora.com.\n\nIf checkout is connected, you’ll get a confirmation and tracking from there. If something looks stuck, don’t wait a week; ping us.',
    keywords: ['track', 'tracking', 'order status', 'where is', 'package', 'parcel', 'change address', 'cancel', 'missing'],
    followUps: ['orders-faulty', 'orders-returns', 'orders-contact'],
    links: [
      { label: 'WhatsApp us', href: whatsappHref('Hi Whaleora! I have a question about my order.') },
      { label: 'Email hello@whaleora.com', href: 'mailto:hello@whaleora.com' },
    ],
  },
  {
    id: 'orders-payment',
    category: 'orders',
    question: 'What payment methods do you accept?',
    answer:
      'Checkout shows the methods available for your order — typically the usual Indian cards, UPI and net banking when Shopify checkout is connected. Taxes are included. We don’t add a subscription or a service fee on top of the product price.\n\nIf checkout isn’t completing, message us on WhatsApp and we’ll take the order there. Same prices.',
    keywords: ['payment', 'pay', 'upi', 'card', 'cod', 'cash on delivery', 'gpay', 'phonepe', 'emi', 'gst', 'invoice', 'bill'],
    followUps: ['orders-shipping', 'orders-contact', 'choose-prices'],
    links: [{ label: 'WhatsApp to order', href: whatsappHref("Hi Whaleora! I'd like to place an order.") }],
  },
  {
    id: 'orders-faulty',
    category: 'orders',
    featured: true,
    question: 'Something arrived faulty. Now what?',
    answer:
      'Email hello@whaleora.com and tell us what it did. We’ll replace it — you don’t have to build a case for it first. Please get in touch before posting anything back so we can tell you where to send it.\n\nInclude your order name, a short description, and a photo if you have one. WhatsApp is fine for the first message.',
    keywords: ['faulty', 'broken', 'defective', 'doesn’t work', 'not working', 'replace', 'warranty', 'damaged', 'wrong item'],
    followUps: ['orders-returns', 'orders-contact', 'care-test'],
    links: [
      { label: 'Warranty & claims', href: '/warranty' },
      { label: 'Email support', href: 'mailto:hello@whaleora.com?subject=Faulty%20item' },
      { label: 'WhatsApp', href: whatsappHref('Hi Whaleora! Something arrived faulty.') },
    ],
  },
  {
    id: 'orders-returns',
    category: 'orders',
    question: 'What’s your return policy?',
    answer:
      'If it arrived faulty, we replace it — contact us before you post anything back. For a change of mind, email hello@whaleora.com with the order details and we’ll tell you whether we can take it back unused, in original packaging.\n\nPepper spray that has been unlocked, and any tool that has been used, cannot go back into stock. We’ll always rather sort it by email than leave you guessing at a courier counter.',
    keywords: ['return', 'refund', 'exchange', 'send back', 'policy', 'unused', 'change of mind'],
    followUps: ['orders-faulty', 'orders-contact', 'pepper-how'],
    links: [{ label: 'Contact support', href: '/contact' }],
  },
  {
    id: 'orders-contact',
    category: 'orders',
    question: 'How do I reach a real person?',
    answer:
      'WhatsApp is fastest: a quick question, an order status, or which product suits you. Email hello@whaleora.com for anything that needs a proper written answer — faults, partnerships, invoices.\n\nA real person reads these. We are based in Sambhaji Nagar, Thane, Maharashtra.',
    keywords: ['contact', 'whatsapp', 'email', 'phone', 'human', 'support', 'hello', 'thane', 'address', 'talk to', 'call'],
    followUps: ['partnerships-how', 'orders-faulty', 'brand-where'],
    links: [
      { label: 'WhatsApp', href: whatsappHref('Hi Whaleora! I have an inquiry.') },
      { label: 'hello@whaleora.com', href: 'mailto:hello@whaleora.com' },
      { label: 'Contact page', href: '/contact' },
    ],
  },
  {
    id: 'legal-flight',
    category: 'legal',
    featured: true,
    question: 'Can I take a safety kit on a flight?',
    answer:
      'The whistle, yes — it is a piece of aluminium.\n\nPepper spray is prohibited on effectively every airline, cabin and usually checked too. The window breaker is a sharp tool with a concealed blade; it belongs in a car, not a carry-on or checked bag. The SOS Alarm is an electronic device with a coin cell — most carriers allow it in cabin, but check your airline’s list rather than ours.\n\nWhen in doubt, put the spray and the breaker in the car you left at home, and take the whistle.',
    keywords: ['flight', 'plane', 'airline', 'airport', 'cabin', 'checked bag', 'travel', 'tsa', 'security', 'aeroplane', 'airplane', 'carry on'],
    followUps: ['pepper-legal', 'window-where', 'whistle-how'],
    links: [{ label: 'Survival Whistle', href: '/products/whistle' }],
  },
  {
    id: 'legal-venues',
    category: 'legal',
    question: 'Can I take these into a college, court or event?',
    answer:
      'Acoustic tools (alarm, whistle) are usually fine. Pepper spray and anything with a blade (the window breaker) are the ones venues, campuses and government buildings restrict.\n\nCheck the bag policy before you go. If a security desk asks you to leave something, leave it — the tool is not more important than getting where you need to be.',
    keywords: ['college', 'court', 'concert', 'stadium', 'metro security', 'bag check', 'venue', 'restricted', 'hostel rules'],
    followUps: ['pepper-legal', 'legal-flight', 'choose-student'],
  },
  {
    id: 'care-battery',
    category: 'care',
    featured: true,
    question: 'Do the alarms need charging? What if the battery dies?',
    answer:
      'No charging cable. The SOS Alarm runs on a replaceable CR2032 coin cell — the same one as a car key fob, about ₹50 at any chemist. One comes in the box. Swap it yourself; there is no service centre visit.\n\nThe whistle and the window breaker have no battery and no electronics at all, which is exactly why we sell them alongside the alarm. If the cell dies at a bad moment, you still have a 120dB breath-powered backup if you clipped one on.',
    keywords: ['battery', 'charge', 'charging', 'cr2032', 'coin cell', 'dies', 'dead', 'replace battery', 'usb', 'power'],
    followUps: ['care-test', 'choose-alarm-vs-whistle', 'alarm-how'],
    links: [{ label: 'Personal SOS Alarm', href: '/products/sos-alarm' }],
  },
  {
    id: 'care-test',
    category: 'care',
    question: 'Should I test the alarm?',
    answer:
      'Yes — once, outdoors or with a warning to whoever is in the next room. Pull the pin for a second or two, push it back in, and you’ve confirmed both the siren and that you can find the pin under stress.\n\nDon’t test it in a quiet carriage, a hostel corridor at midnight, or a cinema. After a test, check the pin is fully seated so it cannot fire in a bag.',
    keywords: ['test', 'try', 'practice', 'demo', 'false alarm', 'accidental', 'check it works'],
    followUps: ['care-battery', 'alarm-how', 'care-storage'],
  },
  {
    id: 'care-storage',
    category: 'care',
    question: 'How should I store these?',
    answer:
      'On you, or where a belted person can reach them. A safety tool in a drawer is an ornament.\n\nKeep pepper spray out of direct sun and not on a car dashboard. Keep the window breaker in the car, not on the keys you take through airport security. Keep the alarm and whistle on the bag or keyring you actually leave the house with.\n\nHeat, lint in the whistle tubes, and a loose alarm pin are the three things worth a monthly glance.',
    keywords: ['store', 'storage', 'heat', 'sun', 'drawer', 'dashboard', 'maintain', 'care', 'clean'],
    followUps: ['pepper-shelf', 'window-where', 'care-test'],
  },
  {
    id: 'partnerships-how',
    category: 'partnerships',
    question: 'Do you run workshops or campus programmes?',
    answer:
      'Yes. Universities, workplaces, community groups and retail partners. We run the session, leave resources people can go back to, and pick products to fit the group — not the other way round.\n\nFour steps: we ask about your people, we propose the mix and the cost, we deliver on your campus or floor, and the resources stay available afterwards.\n\nWhatsApp is the right first message. Tell us roughly how many people and what you’re trying to look after.',
    keywords: ['workshop', 'campus', 'university', 'corporate', 'office', 'training', 'session', 'partnership', 'bulk', 'wholesale', 'ngo', 'institution', 'college programme'],
    followUps: ['partnerships-retail', 'choose-student', 'orders-contact'],
    links: [
      { label: 'Partnerships', href: '/institutions' },
      { label: 'WhatsApp partnerships', href: whatsappHref('Hi Whaleora! I would like to explore institutional partnerships.') },
    ],
  },
  {
    id: 'partnerships-retail',
    category: 'partnerships',
    question: 'Can we stock Whaleora in a shop?',
    answer:
      'Yes — for shops whose customers already ask for this and currently get pointed elsewhere. Email hello@whaleora.com with the subject “Partnership enquiry”, or WhatsApp us. Include where you are and roughly what you already sell.\n\nWe are not a marketplace reseller programme; we work with people who will talk a customer through which tool they actually need.',
    keywords: ['retail', 'stockist', 'wholesale', 'distributor', 'shop', 'store', 'resell', 'dealer'],
    followUps: ['partnerships-how', 'orders-contact', 'choose-prices'],
    links: [{ label: 'Start a partnership enquiry', href: 'mailto:hello@whaleora.com?subject=Partnership%20enquiry' }],
  },
  {
    id: 'brand-what',
    category: 'brand',
    question: 'What is Whaleora?',
    answer:
      'Personal safety tools that fit on a keyring. A 130dB SOS alarm, a 120dB whistle, pepper spray and a car window breaker. Honest specs, ₹299 to ₹1,799, designed so they feel like something you’d actually carry — not tactical gear, not a novelty charm.\n\nFounded by Sheuli in Mumbai. The line is “prepared, not afraid.” We also give away guides on the Safety Hub because a product on its own was never the point.',
    keywords: ['whaleora', 'about', 'brand', 'what is', 'company', 'who are you', 'mission', 'story'],
    followUps: ['brand-where', 'brand-hub', 'choose-which'],
    links: [
      { label: 'Our story', href: '/about' },
      { label: 'Shop', href: '/products' },
    ],
  },
  {
    id: 'brand-where',
    category: 'brand',
    question: 'Where are you based?',
    answer:
      'Sambhaji Nagar, Thane, Maharashtra — designed in India, shipped across India. Founder Sheuli started Whaleora after finding only two options: intimidating tactical gear, or a pretty keychain that didn’t work.\n\nInstagram is @whaleora.safety. Email is hello@whaleora.com.',
    keywords: ['where', 'thane', 'mumbai', 'maharashtra', 'india', 'address', 'founded', 'sheuli', 'founder', 'instagram'],
    followUps: ['brand-what', 'orders-contact', 'brand-hub'],
    links: [
      { label: 'About Whaleora', href: '/about' },
      { label: 'Instagram', href: 'https://www.instagram.com/whaleora.safety' },
    ],
  },
  {
    id: 'brand-hub',
    category: 'brand',
    question: 'Do you have free safety guides?',
    answer:
      'Yes. The Safety Hub is checklists and short reads for commutes, campus life, travel and working late. Free, no signup, no email gate. Written to be useful on a second read — not to scare you into buying an alarm.\n\nThere is also a printable emergency contact card you can fill in and keep in a wallet.',
    keywords: ['guide', 'hub', 'checklist', 'blog', 'article', 'emergency card', 'free', 'tips', 'advice'],
    followUps: ['choose-student', 'partnerships-how', 'brand-what'],
    links: [
      { label: 'Safety Hub', href: '/safety-hub' },
      { label: 'Emergency contact card', href: '/safety-hub#emergency-card' },
    ],
  },
];

export const faqById = new Map(faqs.map((entry) => [entry.id, entry]));

export const faqsByCategory = (category: FaqCategory) => faqs.filter((entry) => entry.category === category);

export const featuredFaqs = faqs.filter((entry) => entry.featured);

export const greetingText =
  'Ask about a product, a flight, a battery, a campus session, or an order. I’ll answer from what we actually sell and ship — and I’ll say so when you need a person instead.';
