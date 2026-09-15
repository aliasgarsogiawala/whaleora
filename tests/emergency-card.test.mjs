import assert from 'node:assert/strict';
import test from 'node:test';
import { CARD_FIELDS, blankCard, cardLimit, isCardEmpty, toCard } from '../lib/emergency-card.ts';

test('a blank card is empty, and one typed character is not', () => {
  assert.equal(isCardEmpty(blankCard), true);
  assert.equal(isCardEmpty({ ...blankCard, name: 'A' }), false);
  // Whitespace alone is not worth storing.
  assert.equal(isCardEmpty({ ...blankCard, notes: '   ' }), true);
});

test('unknown keys are dropped rather than stored', () => {
  // The action passes whatever the browser posted straight to toCard, so this
  // is what stops an arbitrary payload reaching the database.
  const card = toCard({ name: 'Asha', admin: true, __proto__: { polluted: 1 }, extra: 'x' });
  assert.deepEqual(Object.keys(card).sort(), [...CARD_FIELDS].sort());
  assert.equal(card.name, 'Asha');
  assert.equal('admin' in card, false);
  assert.equal('extra' in card, false);
});

test('every field is capped, so one request cannot stuff the table', () => {
  const huge = 'x'.repeat(10_000);
  const card = toCard(Object.fromEntries(CARD_FIELDS.map((f) => [f, huge])));
  for (const field of CARD_FIELDS) {
    assert.equal(card[field].length, cardLimit(field), `${field} was not capped`);
  }
});

test('non-string and missing values fall back to blank', () => {
  const card = toCard({ name: 42, notes: null, address: undefined, blood: { x: 1 } });
  assert.equal(card.name, '');
  assert.equal(card.notes, '');
  assert.equal(card.address, '');
  assert.equal(card.blood, '');
});

test('junk input still yields a usable card rather than throwing', () => {
  for (const input of [null, undefined, 'a string', 7, []]) {
    assert.deepEqual(toCard(input), blankCard);
  }
});

test('every field declared on the card has a cap', () => {
  // A new field added to CardData without a limit would be stored uncapped.
  for (const field of Object.keys(blankCard)) {
    assert.equal(typeof cardLimit(field), 'number', `${field} has no limit`);
  }
  assert.equal(CARD_FIELDS.length, Object.keys(blankCard).length);
});
