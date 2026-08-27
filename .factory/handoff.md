# Recipe Exit Pack — build handoff

Work order: `recipe-exit-pack-build-1`

Completed: 2026-08-27

## What shipped

- A distinctive neo-brutalist “archive bench” landing page and responsive 390px experience, based on the product-specific system in `.factory/design.md`.
- An original generated paper-cut hero illustration, reviewed and optimized to 28 KB / 96 KB WebP variants with a 144 KB JPEG fallback. Source, prompt, generation metadata, and disclosure are included.
- A local-only importer for ZIP, Mela, Paprika, gzip-compressed Paprika recipes, JSON/JSON-LD, HTML with Recipe structured data, Markdown, plain text, and common image formats.
- Normalization for common recipe field names, nested Schema.org instructions, ingredient objects, tags, user notes, source URLs, authors, and embedded base64 photos.
- Image matching by source hint, recipe id/title, and archive folder. JPEG/PNG/AVIF and other browser-decodable stills are resized to a 1600px maximum and converted to WebP; HEIC/HEIF uses a lazy-loaded decoder; GIF and undecodable-but-readable formats are preserved.
- A complete review workbench: searchable recipe stack, editable title/ingredients/directions/notes/source/attribution/tags, image preview/replacement, visible progress and errors, add-more flow, and reversible removal with Undo.
- ZIP export with one folder per recipe containing `recipe.md`, `metadata.json`, and a matched image, plus `manifest/sources.md`, `manifest/recipes.json`, and a plain-text README.
- Offline service worker, install manifest, explicit online/offline status, caching headers, CSP/security headers, robots and sitemap files.
- Optional $9 one-time Archive Plus license integration through the Sociobot API: checkout link, return-token capture and URL cleanup, daily cached verification, offline optimistic unlock, restore field, quiet invalid/revoked state, and local IndexedDB auto-resume. Unlimited core import/edit/export remains free.
- Plain-language `/privacy/` and `/terms/` pages, MIT license, and expanded run/build/deploy documentation.

## How to run and verify

```sh
npm install
npm test
npm run build
npm run test:e2e
npm run preview
```

Production build command: `npm run build`

Deploy directory: `dist/` (contains `dist/index.html` at its root)

Verification completed from a clean production build:

- Vitest: 8/8 passed, including a 100-recipe synthetic export where 100% retained title, ingredients, steps, notes, and source URL.
- Playwright: 6/6 passed — paste/edit/download, JSON+image matching, no console errors, 390px no-overflow check, legal landmarks, axe scan, and interactive offline reopen.
- Axe: 0 serious or critical violations on the landing/converter page.
- Lighthouse 12.8.2, mobile profile on the production preview:
  - Performance: 100
  - Accessibility: 100
  - Best practices: 100
  - SEO: 100
  - FCP: 1.1 s; LCP: 1.7 s; CLS: 0; total blocking time: 0 ms
- Initial bundle: 37.26 KB JavaScript raw / 15.72 KB gzip; 17.30 KB CSS raw / 4.42 KB gzip; no webfonts. The 1.35 MB HEIC decoder is a separate dynamic chunk and is not fetched on initial load.
- Hero: 28 KB at 720px and 96 KB at 1280px WebP, both under the 300 KB budget.

## Known gaps and next steps

- Proprietary export schemas change. The importer uses documented/common field shapes and honest fallback warnings, but it should be checked against fresh real-world Mela and Paprika exports before marketing a formal compatibility guarantee.
- The 100-recipe benchmark validates all textual fields, and browser coverage validates image matching/normalization on a representative record. A licensed, redistributable 100-recipe vendor fixture with 100 distinct photos was not available, so the brief’s 90%-with-image target still needs a real corpus acceptance run.
- HEIC support deliberately loads a large decoder only after a HEIC/HEIF file is selected. This protects first-load performance but means first-time HEIC conversion needs a network connection unless the chunk was previously cached.
- The factory still needs to register and price the Sociobot product before checkout can complete in production. No provider product id or secret is embedded here.
