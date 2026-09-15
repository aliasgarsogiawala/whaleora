'use server';

import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { convexUrl } from '@/lib/convex';
import { currentCustomerEmail, customerAuthConfigured } from '@/lib/shopify/customer';
import { isCardEmpty, toCard, type CardData } from '@/lib/emergency-card';

/**
 * Storing the Safety Hub's emergency card.
 *
 * The card holds medical details, a home address and two other people's phone
 * numbers, so the identifier that reaches it never leaves the server: signed-in
 * owners are keyed on their customer email, everyone else on an opaque id in an
 * httpOnly cookie. The browser sends card contents and gets card contents back,
 * and never learns the key either is stored under.
 */

const DEVICE_COOKIE = 'whaleora_card';
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const secret = () => process.env.ORDERS_INGEST_SECRET ?? '';
/** Storage needs both a database and the secret that guards it. */
const configured = () => Boolean(convexUrl() && secret());

/** The signed-in customer's email, or null when accounts are off or signed out. */
async function ownerEmail(): Promise<string | null> {
  if (!customerAuthConfigured()) return null;
  try {
    return await currentCustomerEmail();
  } catch {
    return null;
  }
}

/**
 * Who this card belongs to. Reading never mints a cookie — only a save does —
 * so merely opening the Safety Hub does not tag the visitor.
 */
async function owner({ create }: { create: boolean }) {
  const jar = await cookies();
  const email = await ownerEmail();
  let device = jar.get(DEVICE_COOKIE)?.value ?? null;
  if (!device && create) {
    device = randomUUID();
    jar.set(DEVICE_COOKIE, device, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: DEVICE_COOKIE_MAX_AGE,
    });
  }
  // A signed-in owner is keyed on the account, so the card follows them to a
  // new device; the device id is the fallback for everyone else.
  const ownerKey = email ? `email:${email.trim().toLowerCase()}` : device ? `device:${device}` : null;
  return { ownerKey, email, emailNormalized: email ? email.trim().toLowerCase() : undefined };
}

export type StoredCard = { card: CardData; updatedAt: string } | null;

export async function loadCardAction(): Promise<StoredCard> {
  if (!configured()) return null;
  const { ownerKey, emailNormalized } = await owner({ create: false });
  if (!ownerKey) return null;
  try {
    const found = await fetchQuery(
      api.emergencyCards.get,
      { secret: secret(), ownerKey, emailNormalized },
      { url: convexUrl() },
    );
    return found ? { card: toCard(found.card), updatedAt: found.updatedAt } : null;
  } catch (error) {
    // The card still works from localStorage; a storage outage must not take
    // the tool down with it.
    console.error('[emergency-card] load failed', error);
    return null;
  }
}

export async function saveCardAction(input: unknown): Promise<{ ok: boolean }> {
  if (!configured()) return { ok: false };
  const card = toCard(input);
  if (isCardEmpty(card)) return { ok: false };
  const { ownerKey, email } = await owner({ create: true });
  if (!ownerKey) return { ok: false };
  try {
    await fetchMutation(
      api.emergencyCards.save,
      { secret: secret(), ownerKey, email: email ?? undefined, card },
      { url: convexUrl() },
    );
    return { ok: true };
  } catch (error) {
    console.error('[emergency-card] save failed', error);
    return { ok: false };
  }
}

/** Clearing the card wipes the stored copy as well as the one on the device. */
export async function clearCardAction(): Promise<{ ok: boolean }> {
  if (!configured()) return { ok: false };
  const { ownerKey, emailNormalized } = await owner({ create: false });
  if (!ownerKey) return { ok: true };
  try {
    await fetchMutation(
      api.emergencyCards.remove,
      { secret: secret(), ownerKey, emailNormalized },
      { url: convexUrl() },
    );
    return { ok: true };
  } catch (error) {
    console.error('[emergency-card] clear failed', error);
    return { ok: false };
  }
}
