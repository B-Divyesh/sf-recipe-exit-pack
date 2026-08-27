# Recipe Exit Pack — independent verification

**Result: FAIL**

Verified on 2026-08-27 against candidate commit
`291cc057c2529067620f83a1bad49244b859c912` and the deployed URL
<https://recipe-exit-pack.sociobot.in/>. Product source was not modified.

## Release blockers

### P1 — Archive Plus checkout is unavailable in production

The live buy link is
`https://api.sociobot.in/api/v1/products/recipe-exit-pack/checkout`. A fresh
GET on 2026-08-27 returned **HTTP 404** with:

```json
{"error":"enabled factory product","status":404}
```

The UI offers and prices Archive Plus at $9, so a customer cannot complete the
advertised one-time purchase. The verifier did not attempt a payment. The
invalid-license endpoint itself responded as expected (HTTP 200,
`{"valid":false,"reason":"invalid","expires_at":null}`), so this is a
missing/unavailable checkout product rather than a browser connectivity issue.

### P1 — Service-worker update breaks the promised offline converter

`public/sw.js` only precaches HTML/legal files, manifest/favicon, and the
small hero image. It does not precache the hashed application JavaScript or
CSS. Its activation handler deletes every previous cache.

I reproduced an update against the exact production build in an isolated local
HTTP harness: version 1 first cached the shell plus
`/assets/main-BkmO6G6V.js` and `/assets/main-Duv_AI13.css`; a byte-identical
service-worker update with only `recipe-exit-pack-v1` changed to `v2` completed
and left only the `recipe-exit-pack-v2` cache. That cache contained no main JS
or CSS. Taking the browser offline and reloading then produced two
`net::ERR_FAILED` resource errors for those assets; the connection pill stayed
at `Checking connection…`, proving that `src/main.ts` had not run.

The current first-install offline test passes, but an updated installation
cannot reload into a usable converter while offline. This violates the stated
offline guarantee and PWA update requirement.

## P2 defect

### Corrupt image is accepted as a readable image

On the live app, replacing a valid matched image with a file named
`corrupt.png` containing non-image bytes reports:

> Matched PNG image; preserved in its readable source format.

No error notice is shown. The preview image has `naturalWidth === 0`; the
corrupt bytes can then be packed. The error/recovery path should reject it (or
clearly warn and avoid representing it as viewable) while preserving the
recipe and allowing a replacement image.

## Passed evidence

- Clean candidate checkout was already at the requested SHA and clean before
  verification. `npm ci` completed with 0 reported vulnerabilities.
- `npm test`: **8/8 passed**.
- Exact production command `npm run build`: passed (`tsc --noEmit` and Vite)
  and produced `dist/`. Vite emitted a warning for the 1.35 MB lazy HEIC
  chunk; the initial application bundle remains 37.26 KB raw / 15.72 KB gzip,
  CSS 17.30 KB raw / 4.42 KB gzip, zero font bytes, and mobile hero WebP
  27.97 KB. These meet the initial 200 KB JS, 50 KB CSS, and 300 KB hero
  budgets.
- The repository browser suite initially could not launch in the clean
  environment because Playwright Chromium was absent. After the standard
  `npx playwright install chromium` provisioning step, `npm run test:e2e`
  passed **6/6** from the production preview.
- Independent live normal-flow test: pasted recipe title, ingredients,
  directions, notes, source URL, attribution, and tags survived review and
  appeared in `recipe.md` and `manifest/sources.md` inside the downloaded ZIP.
  No console or page errors occurred.
- Boundary test: a user-supplied JSON array of 100 recipes imported as 100 and
  exported 100 recipe folders / 100 manifest records, with first and last
  titles intact. The included unit test also validates the 100-record textual
  preservation case.
- Error/recovery test: malformed pasted JSON displayed a specific parse error;
  replacing it with valid text immediately imported `Recovery soup`.
- Valid JSON plus a one-pixel PNG matched, decoded, previewed
  (`naturalWidth: 1`), and normalized to WebP.
- Live desktop (1440px) and 390px mobile checks had no horizontal overflow.
  The 390px primary action was 354×47.8px. Keyboard starts at the skip link
  (`href="#main"`) and visible focus is a 4px blue outline. Reduced-motion
  computed transition duration was 0.00001s. No keyboard trap was observed.
- Live axe-core scan found **0 serious/critical** findings (0 violations at
  all impacts). The live page has `lang=en`, one `<h1>`, one `<main>`, title,
  labelled controls, meaningful hero alt text, and legal pages each have one
  h1/main landmark.
- Initial live load requested only same-origin HTML, main JS/CSS, and hero
  WebP; no trackers, fonts, recipe uploads, or other third-party requests were
  made. Static inspection confirms the only optional cross-origin request is
  Sociobot license verification/checkout. Recipe conversion is browser-local.
- Live artifact parity is exact: SHA-256/cmp matched local `dist/index.html`,
  `dist/assets/main-BkmO6G6V.js`, and `dist/sw.js` to the deployment.
- Live response policies were present: HSTS, CSP restricting scripts/styles to
  self and connects to self plus Sociobot API, `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and
  disabled camera/microphone/geolocation. Hashed JS/CSS/hero were
  `public, max-age=31536000, immutable`; `sw.js` was `no-cache`.
- The live manifest parsed without Chrome errors. First-install offline reload
  remains covered by the passing repository Playwright test; the update case
  above is the release blocker.

## Remaining verification limits

The synthetic 100-recipe test proves title/ingredients/directions/notes/source
preservation but does not provide a licensed 100-distinct-image corpus. Thus
the brief's 90%-with-viewable-image success measure is not independently
demonstrated. This is additional acceptance evidence still required after the
P1 fixes.

## Re-run

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Then run the live normal, malformed-image, checkout, and service-worker update
checks described above before declaring a release pass.
