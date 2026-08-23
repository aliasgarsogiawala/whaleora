# Whaleora website audit

Audit date: 23 August 2026  
Source: https://whaleora.vercel.app/

## Current sitemap

- `/` — brand story, product highlights, Safety Hub preview, founder story
- `/products` — filtered catalogue (All, Kits, Alarms, Tools, Apparel)
- `/products/sos-alarm`
- `/products/pepperspray`
- `/products/windowbreaker`
- `/products/whistle`
- `/about`
- `/institutions`
- `/safety-hub`
- `/contact`
- Cart drawer and newsletter are global surfaces.
- The live navigation also references product routes that are not consistently reachable from the collection, including a drink cover.
- Privacy and Terms are currently placeholder `#` links.

## Brand strengths

- Distinctive warm cream / terracotta / deep navy palette: `#FBECDB`, `#DA6D40`, `#0F2643`.
- Strong, responsible positioning: safety as preparedness rather than panic.
- A human founder narrative and an authentic founder portrait.
- A useful ecosystem story spanning products, education and institutional partnerships.
- Original Whaleora product mockups and a recognizable repeating whale-tail pattern.
- Clear core line: “Your Safety. Our Priority.”

## Design and UX weaknesses

- System UI fonts make the identity feel younger and less ownable than the brand story.
- The homepage moves through several similarly weighted blocks; the product and story moments need more editorial contrast.
- Product cards do not consistently expose price, category, usage context or a clear quick-add path.
- The collection is seen in a loading state before client data resolves, reducing perceived quality.
- PDPs are utilitarian: one dominant image, basic quantity controls and specifications, with limited story, scenario or cross-sell depth.
- Safety Hub contains valuable material but its information architecture feels like a long utility page rather than a modern publication.
- Persona selection uses emoji, which clashes with the premium visual intent.
- Institutional content is credible but visually close to the consumer site instead of feeling like a focused conversion journey.
- Footer legal links are placeholders; the X/Twitter link is also a placeholder.
- Cart lacks a visually clear free-shipping progress treatment and polished product states.
- Existing review counts and claims appear without an obvious verified source; the revamp does not repeat those claims.

## Content opportunities

- Lead with the compact SOS alarm as an everyday-carry object while preserving the broader product collection.
- Alternate lifestyle scenes, product closeups and short, accountable copy to create a calmer rhythm.
- Turn Safety Hub into an editorial destination with persona and category filtering.
- Make founder and institutional stories full-bleed editorial moments instead of card modules.
- Use the real address, WhatsApp channel and email already present on the live site.

## Technical observations

- Current site is a Next.js application using optimized images and Tailwind-like design tokens.
- Global colour tokens are already coherent but heading/body font variables are empty.
- Several images are loaded from Shopify CDN while other Whaleora-owned assets live in the app bundle.
- Product and review surfaces show loading states, implying client-side fetching.
- The new prototype keeps cart state device-local and avoids claiming a production checkout connection.

## Revamp priorities

1. Preserve the Whaleora palette, logo, founder image, product photography and message.
2. Build an ownable editorial typography system and more varied art direction.
3. Make products visually desirable without overpromising their effect.
4. Give Safety Hub a scalable publication structure.
5. Add functional navigation, filtering, cart, newsletter feedback and responsive behavior.
6. Keep unverified claims, testimonials, certifications and partner logos out of the prototype.
