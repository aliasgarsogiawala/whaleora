# Whaleora content studio

Open `/admin` to edit written testimonials, video reviews, media, ordering, visibility, headings and marquee speed. The original storefront palette is unchanged.

## Local development

Run `npm run dev`, visit `http://localhost:3000/admin`, and create your own password (12+ characters). First-time setup is only available on a local development hostname. There is no default password. Credentials are scrypt-hashed; the browser receives an eight-hour HttpOnly session cookie.

Content and uploads persist in `.whaleora/`, which is gitignored. Back up this directory. `CONTENT_DATA_DIR` can point to another private persistent directory. Do not put it inside `public/`. Local storage is intended for a single server process; use Redis for multi-instance hosting.

New items start hidden. Complete all required fields before saving, even for hidden items. Keep the demo checkbox enabled for fictional content. Real testimonials require permission from their authors.

- **Save draft:** persists edits without changing the live site.
- **Preview:** shows the current unsaved text and playable media. The live store retains its circular video gallery.
- **Publish:** validates, saves and publishes the current edits after confirmation. Reload the storefront to see them.
- **Reload saved draft:** available after an error; warns before discarding unsaved edits. Concurrent edits in another tab cannot silently overwrite newer saves.

Local uploads accept MP4 videos up to 30 MB and JPG/PNG/WebP thumbnails up to 5 MB. They are served through `/api/media/…` with video range requests supported. Uploads are public to anyone with the URL; never upload private media. Removing a review does not delete its uploaded file. Unused media is retained to avoid breaking existing published links.

## Production / Vercel

Set these server-only environment variables before deployment:

```text
ADMIN_PASSWORD=<a unique long password, at least 12 characters>
ADMIN_SESSION_SECRET=<random secret, at least 32 characters>
ADMIN_ORIGIN=https://your-store-domain.example
UPSTASH_REDIS_REST_URL=<Upstash Redis REST endpoint>
UPSTASH_REDIS_REST_TOKEN=<Upstash Redis REST token>
CONTENT_NAMESPACE=whaleora-production
```

Generate a session secret with `openssl rand -hex 32`. Never prefix these variables with `NEXT_PUBLIC_`. Changing the password or secret invalidates existing sessions. `ADMIN_ORIGIN` must exactly match the origin used to visit the panel (no trailing slash); set it when using a reverse proxy. Use HTTPS in production.

Vercel saves require Redis and local uploads are disabled there. Upload videos/images to Shopify Files or your media host and paste their HTTPS URLs. Redis holds the content document, not video files. An empty Redis database starts with the bundled demo reviews; to migrate local content, copy `.whaleora/reviews.json` into the Redis key `<CONTENT_NAMESPACE>:reviews` before editing on the new host. Take a backup first. Keep preview and production namespaces separate.

The adapter uses the [Upstash REST API](https://upstash.com/docs/redis/features/restapi) with atomic revision checks. If storage is unavailable, the public storefront falls back to bundled demos and the admin refuses to save; errors do not overwrite saved content. This project does not provision a hosted database automatically.

For a self-hosted Node server, a persistent private `CONTENT_DATA_DIR` can be used instead of Redis. Use one server process and back up both credentials and content. Configure the password and session secret through environment variables in production.

## Checks

For an isolated end-to-end run: create a temporary directory with `mktemp -d`, then start `CONTENT_DATA_DIR=<that-directory> NEXT_DIST_DIR=.next-admin-test npm run dev -- --port 3002`. Visit `http://localhost:3002/admin` and set the test-only password `Whaleora-test-only-2026!`. Run `ADMIN_ISOLATED_TEST=1 node tests/admin-integration.mjs`. Never use this test password for your actual store. The test exercises publish/save, authentication, CSRF, conflict detection, uploads, ranges and rate limits against port 3002 only.

`npm run lint` and `npx tsc --noEmit` check the implementation. `node --experimental-strip-types --test tests/content.test.mjs` validates content input. The admin APIs enforce session authentication, same-origin mutations, request size limits and login throttling. This is a single-admin content editor, not a multi-user role-management system.
