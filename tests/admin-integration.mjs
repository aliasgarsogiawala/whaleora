// Run only against a separate dev server with CONTENT_DATA_DIR pointing at a temporary directory.
// Test credential below belongs exclusively to that isolated instance.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = 'http://localhost:3002';
if (process.env.ADMIN_ISOLATED_TEST !== '1') throw new Error('Use ADMIN_ISOLATED_TEST=1 only after starting the isolated test instance described in ADMIN.md.');
let cookie = '';
async function api(path, method = 'GET', data, extra = {}) {
  return fetch(`${origin}${path}`, { method, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(data ? { 'Content-Type': 'application/json' } : {}), ...extra }, body: data ? JSON.stringify(data) : undefined });
}
assert.equal((await api('/api/admin/content')).status, 401);
assert.equal((await api('/api/admin/content', 'PUT', {})).status, 401);
assert.equal((await api('/api/admin/session', 'POST', { action: 'login', password: 'wrong' }, { Origin: 'https://evil.example' })).status, 403);
assert.equal((await api('/api/admin/session', 'POST', { action: 'login', password: 'wrong' })).status, 401);
const login = await api('/api/admin/session', 'POST', { action: 'login', password: 'Whaleora-test-only-2026!' });
assert.equal(login.status, 200);
const setCookie = login.headers.get('set-cookie');
assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=strict/i);
cookie = setCookie.split(';')[0];
const initial = await (await api('/api/admin/content')).json();
const draft = structuredClone(initial.draft);
const marker = `Isolated draft test ${Date.now()}`;
draft.testimonials[0].quote = marker;
let response = await api('/api/admin/content', 'PUT', { content: draft, revision: initial.revision, publish: false });
assert.equal(response.status, 200);
let saved = await response.json();
assert.equal(saved.draft.testimonials[0].quote, marker);
assert.notEqual(saved.published.testimonials[0].quote, marker);
assert.equal((await (await fetch(origin)).text()).includes(marker), false);
response = await api('/api/admin/content', 'PUT', { content: draft, revision: saved.revision, publish: true });
assert.equal(response.status, 200); saved = await response.json();
assert.equal((await (await fetch(origin)).text()).includes(marker), true);
assert.equal((await api('/api/admin/content', 'PUT', { content: draft, revision: initial.revision, publish: true })).status, 409);
const invalid = structuredClone(draft); invalid.videos[0].video = 'javascript:alert(1)';
assert.equal((await api('/api/admin/content', 'PUT', { content: invalid, revision: saved.revision, publish: true })).status, 400);
assert.equal((await api('/api/admin/content', 'PUT', { content: draft, revision: saved.revision, publish: true }, { Origin: 'https://evil.example' })).status, 403);
const invalidUpload = await fetch(`${origin}/api/admin/upload`, { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'image/png' }, body: '<script>bad</script>' });
assert.equal(invalidUpload.status, 400);
const video = await readFile(new URL('../public/reviews/alarm-everyday.mp4', import.meta.url));
const uploaded = await fetch(`${origin}/api/admin/upload`, { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'video/mp4' }, body: video });
assert.equal(uploaded.status, 200);
const { url } = await uploaded.json();
const range = await fetch(`${origin}${url}`, { headers: { Range: 'bytes=0-99' } });
assert.equal(range.status, 206); assert.equal(range.headers.get('content-length'), '100');
assert.deepEqual(Buffer.from(await range.arrayBuffer()), video.subarray(0, 100));
assert.equal((await fetch(`${origin}${url}`, { headers: { Range: 'bytes=999999999-' } })).status, 416);
// Restore the isolated instance's initial published content; no real store data is touched.
assert.equal((await api('/api/admin/content', 'PUT', { content: initial.published, revision: saved.revision, publish: true })).status, 200);
assert.equal((await api('/api/admin/session', 'DELETE')).status, 200);
cookie = '';
assert.equal((await api('/api/admin/content')).status, 401);
let throttled = false;
for (let i = 0; i < 9; i++) { if ((await api('/api/admin/session', 'POST', { action: 'login', password: 'wrong' })).status === 429) { throttled = true; break; } }
assert.equal(throttled, true);
console.log('PASS: authentication, CSRF, draft isolation, publishing, stale-revision protection, validation, upload signatures, video ranges, logout and throttling.');
