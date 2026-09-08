#!/usr/bin/env node
/**
 * Verifies the Shopify connection and, more importantly, that each local
 * product actually matches a product in the store.
 *
 *   npm run shopify:check
 *
 * The storefront merges Shopify (price, stock, identity) onto local editorial
 * copy by handle, falling back to a normalised title. When neither matches,
 * nothing errors — the product simply renders twice: once from local copy with
 * no working checkout, once adopted from Shopify with no copy. This reports
 * that before it reaches the site.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Minimal .env reader so the check runs without extra dependencies. */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(resolve(process.cwd(), file), 'utf8').split('\n')) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (!match) continue;
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (value && !process.env[match[1]]) process.env[match[1]] = value;
      }
    } catch { /* file need not exist */ }
  }
}

const pick = (...names) => names.map((n) => process.env[n]).find((v) => v && v.trim())?.trim();

/** Mirrors lib/shopify/catalog.ts, so a match here means a match on the site. */
const normalise = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const LOCAL = [
  { slug: 'sos-alarm', handle: 'sos-alarm', title: 'Personal SOS Alarm' },
  { slug: 'pepperspray', handle: 'pepperspray', title: 'Pepper Spray' },
  { slug: 'windowbreaker', handle: 'windowbreaker', title: 'Emergency Window Breaker' },
  { slug: 'whistle', handle: 'whistle', title: 'Survival Whistle' },
];

const QUERY = `
  query Check($first: Int!) {
    products(first: $first, sortKey: TITLE) {
      nodes {
        handle title availableForSale
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 1) { nodes { id availableForSale } }
      }
    }
  }`;

loadEnv();

const domain = pick('SHOPIFY_STORE_DOMAIN', 'SHOPIFY_SHOP_DOMAIN', 'SHOPIFY_STORE', 'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
const token = pick('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'SHOPIFY_STOREFRONT_API_TOKEN', 'SHOPIFY_PUBLIC_STOREFRONT_TOKEN', 'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
const override = pick('SHOPIFY_STOREFRONT_ENDPOINT');
const version = pick('SHOPIFY_API_VERSION') ?? '2025-07';
const host = domain?.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const endpoint = override ?? (host ? `https://${host}/api/${version}/graphql.json` : undefined);

if (!endpoint) {
  console.error('\n  Not connected. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local');
  console.error('  (see .env.example for where to find them in Shopify admin)\n');
  process.exit(1);
}

console.log(`\n  Store     ${override ? endpoint : host}`);
console.log(`  Token     ${token ? `set (…${token.slice(-4)})` : 'none — fine only for a public mock endpoint'}`);

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Shopify-Storefront-Access-Token': token } : {}) },
  body: JSON.stringify({ query: QUERY, variables: { first: 250 } }),
});

if (!response.ok) {
  const detail = await response.text().catch(() => '');
  console.error(`\n  Storefront API responded ${response.status}.`);
  if (response.status === 401 || response.status === 403) {
    console.error('  The token is wrong, or its app lacks the unauthenticated read scopes.');
  }
  if (response.status === 404) console.error('  Check the store domain and the API version.');
  console.error(`  ${detail.slice(0, 300)}\n`);
  process.exit(1);
}

const body = await response.json();
if (body.errors?.length) {
  console.error(`\n  GraphQL errors: ${body.errors.map((e) => e.message).join('; ')}\n`);
  process.exit(1);
}

const remote = body.data.products.nodes;
console.log(`  Products  ${remote.length} in the store\n`);

const byHandle = new Map(remote.map((p) => [p.handle, p]));
const byTitle = new Map(remote.map((p) => [normalise(p.title), p]));
const claimed = new Set();
let unmatched = 0;

for (const local of LOCAL) {
  const viaHandle = byHandle.get(local.handle);
  const viaTitle = byTitle.get(normalise(local.title));
  const match = viaHandle ?? viaTitle;
  if (match) claimed.add(match.handle);

  const label = local.title.padEnd(26);
  if (!match) {
    unmatched += 1;
    console.log(`  ✗ ${label} no match in store  (looked for handle "${local.handle}" or title "${local.title}")`);
    continue;
  }
  const variant = match.variants.nodes[0];
  const price = match.priceRange.minVariantPrice;
  const how = viaHandle ? 'handle' : `title → store handle "${match.handle}"`;
  const stock = match.availableForSale && variant?.availableForSale ? 'in stock' : 'SOLD OUT';
  console.log(`  ✓ ${label} ${how}`);
  console.log(`    ${' '.repeat(26)} ${price.currencyCode} ${price.amount} · ${stock} · variant ${variant ? 'ok' : 'MISSING'}`);
}

const extras = remote.filter((p) => !claimed.has(p.handle));
if (extras.length) {
  console.log(`\n  ${extras.length} store product${extras.length === 1 ? '' : 's'} with no local copy (each still gets a page):`);
  console.log(`    ${extras.slice(0, 12).map((p) => p.handle).join(', ')}${extras.length > 12 ? ', …' : ''}`);
}

if (unmatched) {
  console.log(`\n  ${unmatched} local product${unmatched === 1 ? '' : 's'} did not match.`);
  console.log('  Fix by setting shopifyHandle in data/products.ts to the store handle,');
  console.log('  or by renaming the product in Shopify admin to match the title exactly.');
  console.log('  Until then each shows twice: local copy without checkout, plus a bare store page.\n');
  process.exit(1);
}

console.log('\n  All four products matched. Checkout will use the real Shopify cart.\n');
