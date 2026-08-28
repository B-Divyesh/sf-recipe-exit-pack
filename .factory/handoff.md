# Repair handoff — perfection loop 1

## Delivered

Repair commit: `760bfafe50c5670a3f5422e39effea7e6087e165` (`fix: complete demo and review repair`).

- Rewrote the first screen around the concrete job, audience, safe sample action, and plain facts while keeping the kitchen-archive neo-brutalist system.
- Added `/demo/` and `?demo=1`: three realistic recipes load immediately, edits use only IndexedDB `demo:recipe-exit-pack`, and the persistent banner can reset or discard the demo.
- Added `.factory/demo.md`, `.factory/claims.json`, and one Playwright sandbox test for every listed claim.
- Added route-specific demo, legal, and 404 metadata; a physical demo route; a designed static 404 response override; focus and live route announcements; sitemap entry; consistent header/footer legal links; 180px Apple touch icon; and a generated 1200 × 630 social card.
- Added a mobile demo banner layout and kept the original paper-cut kitchen archive visual identity intact.

## Verification evidence

Fresh clone: `/tmp/recipe-exit-pack-clean.3Dya1N` at repair commit `760bfafe50c5670a3f5422e39effea7e6087e165`.

| Check | Result |
| --- | --- |
| `npm ci` | passed; 0 vulnerabilities reported |
| `npm test` | passed; 8 tests |
| `npm run build` | passed; `dist/index.html` present |
| `npm run test:e2e -- --workers=1` | passed; 16 tests |
| Every `.factory/claims.json` command | passed individually from a fresh built demo context |
| Accessibility | Playwright axe test passed with no serious or critical findings; keyboard focus, landmarks, title/lang/main/alt checks are in the browser suite |
| Offline/privacy | demo offline-reload, storage-isolation, and complete-flow same-origin interception tests passed |
| Mobile | 390 × 844 browser test passed with no horizontal overflow |
| Lighthouse mobile | performance 100, accessibility 100, best practices 100, SEO 100; FCP 1.1 s, LCP 1.7 s, CLS 0 (report: `/tmp/recipe-exit-pack-lighthouse.json`) |

Initial shipped JS is 17.06 KB gzip and CSS is 4.55 KB gzip. The larger HEIC converter is dynamically imported only when a HEIC/HEIF image is processed.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```

Deploy the generated `dist/` directory to the configured Azure Static Web Apps target. The static config includes production security headers, immutable asset caching, the service worker, and a 404 response override.

## Known gaps

None. The review’s blocking demo, claim-proof, first-read, metadata, routing, legal-link, mobile, and product-copy findings are resolved.
