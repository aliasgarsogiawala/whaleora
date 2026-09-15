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
