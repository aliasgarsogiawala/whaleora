import assert from 'node:assert/strict';
import test from 'node:test';
import { IMAGE_HOSTS, isOptimisableImage } from '../lib/images.ts';

test('local paths are always fine', () => {
  assert.equal(isOptimisableImage('/products/sos-alarm-mockup.webp'), true);
  assert.equal(isOptimisableImage('/brand/whaleora-logo.svg'), true);
});

test('the Shopify CDN and a store on its own myshopify domain are allowed', () => {
  assert.equal(isOptimisableImage('https://cdn.shopify.com/s/files/1/0818/x.png?v=1'), true);
  assert.equal(isOptimisableImage('https://cmdvii-s0.myshopify.com/cdn/shop/files/x.png'), true);
  assert.equal(isOptimisableImage('https://myshopify.com/cdn/shop/files/x.png'), true);
});

test('any other host is rejected, because the optimiser would 400 on it', () => {
  // This is the whole point: an editor pasting one of these used to save fine
  // and show a broken image on the live site.
  assert.equal(isOptimisableImage('https://images.unsplash.com/photo-1.jpg'), false);
  assert.equal(isOptimisableImage('https://example.com/x.png'), false);
});

test('a lookalike host does not slip past the wildcard', () => {
  assert.equal(isOptimisableImage('https://evilmyshopify.com/x.png'), false);
  assert.equal(isOptimisableImage('https://cdn.shopify.com.attacker.net/x.png'), false);
});

test('non-HTTPS and malformed values are rejected', () => {
  assert.equal(isOptimisableImage('http://cdn.shopify.com/x.png'), false);
  assert.equal(isOptimisableImage('not a url'), false);
  assert.equal(isOptimisableImage(''), false);
});

test('the host list is what next.config.ts builds remotePatterns from', () => {
  assert.deepEqual([...IMAGE_HOSTS], ['cdn.shopify.com', '**.myshopify.com']);
});

test('a Shopify photo is recognised, local art and other hosts are not', async () => {
  const { isShopifyImage } = await import('../lib/images.ts');
  assert.equal(isShopifyImage('https://cdn.shopify.com/s/files/1/x.png'), true);
  assert.equal(isShopifyImage('/products/sos-alarm-mockup.webp'), false);
  assert.equal(isShopifyImage('https://example.com/x.png'), false);
  assert.equal(isShopifyImage('https://cdn.shopify.com.attacker.net/x.png'), false);
});

test('the loader asks Shopify for the width, preserving the cache-busting query', async () => {
  const { shopifyImageLoader } = await import('../lib/images.ts');
  assert.equal(
    shopifyImageLoader({ src: 'https://cdn.shopify.com/s/files/1/0818/Whistlemockup.png?v=1786186648', width: 1200 }),
    'https://cdn.shopify.com/s/files/1/0818/Whistlemockup_1200x.png?v=1786186648');
});

test('a size Shopify already put in the filename is replaced, not stacked', async () => {
  const { shopifyImageLoader } = await import('../lib/images.ts');
  assert.equal(
    shopifyImageLoader({ src: 'https://cdn.shopify.com/s/files/1/a_1600x.png?v=1', width: 640 }),
    'https://cdn.shopify.com/s/files/1/a_640x.png?v=1');
  assert.equal(
    shopifyImageLoader({ src: 'https://cdn.shopify.com/s/files/1/a_1600x900.png?v=1', width: 640 }),
    'https://cdn.shopify.com/s/files/1/a_640x.png?v=1');
});

test('a converted second extension stays last, where Shopify wants it', async () => {
  const { shopifyImageLoader } = await import('../lib/images.ts');
  assert.equal(
    shopifyImageLoader({ src: 'https://cdn.shopify.com/s/files/1/a.png.webp?v=1', width: 800 }),
    'https://cdn.shopify.com/s/files/1/a_800x.png.webp?v=1');
});

test('an extensionless name and a non-URL are handled without throwing', async () => {
  const { shopifyImageLoader } = await import('../lib/images.ts');
  assert.equal(
    shopifyImageLoader({ src: 'https://cdn.shopify.com/s/files/1/plain?v=1', width: 400 }),
    'https://cdn.shopify.com/s/files/1/plain_400x?v=1');
  assert.equal(shopifyImageLoader({ src: '/products/local.webp', width: 400 }), '/products/local.webp');
});
