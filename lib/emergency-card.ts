/**
 * The emergency card's shape and the rules for what may be stored.
 *
 * The card is printed at wallet size, so nothing on it is long; the caps below
 * are what fits on the card, and they double as the limit on what a stranger
 * can push into the database. Validation lives here rather than in the Convex
 * function so the form and the server agree on one definition.
 */

export type CardData = {
  name: string;
  blood: string;
  notes: string;
  contactOneName: string;
  contactOneRelation: string;
  contactOnePhone: string;
  contactTwoName: string;
  contactTwoRelation: string;
  contactTwoPhone: string;
  address: string;
};

export const blankCard: CardData = {
  name: '', blood: '', notes: '',
  contactOneName: '', contactOneRelation: '', contactOnePhone: '',
  contactTwoName: '', contactTwoRelation: '', contactTwoPhone: '',
  address: '',
};

/** Per-field caps, in characters. Keyed so a new field cannot be added uncapped. */
const LIMITS: Record<keyof CardData, number> = {
  name: 80,
  blood: 10,
  notes: 200,
  contactOneName: 80,
  contactOneRelation: 40,
  contactOnePhone: 32,
  contactTwoName: 80,
  contactTwoRelation: 40,
  contactTwoPhone: 32,
  address: 240,
};

export const CARD_FIELDS = Object.keys(LIMITS) as (keyof CardData)[];

export const cardLimit = (field: keyof CardData) => LIMITS[field];

/**
 * Coerce anything — a stored row, a localStorage blob, a form post — into a
 * card. Unknown keys are dropped and every field is trimmed to its cap, so the
 * result is always safe to store and always safe to render.
 */
export function toCard(input: unknown): CardData {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const card = { ...blankCard };
  for (const field of CARD_FIELDS) {
    const value = source[field];
    if (typeof value === 'string') card[field] = value.slice(0, LIMITS[field]);
  }
  return card;
}

/** True when the card holds nothing worth saving, so we do not store blanks. */
export const isCardEmpty = (card: CardData) => CARD_FIELDS.every((field) => !card[field].trim());
