# Recipe Exit Pack — verification handoff

**VERIFICATION RESULT: FAIL**

Candidate: `291cc057c2529067620f83a1bad49244b859c912`

Live URL checked: <https://recipe-exit-pack.sociobot.in/>
Verified: 2026-08-27

The candidate builds and its free local conversion flow works, but it is not
ready to release.

## Must fix before release

1. **P1: Register/enable the live Sociobot checkout product.** The advertised
   Archive Plus checkout URL returns HTTP 404 with
   `{"error":"enabled factory product","status":404}`.
2. **P1: Make service-worker updates offline-safe.** A new cache version
   deletes the cache containing the hashed main JS/CSS while precaching neither
   asset. After an update, an offline reload fails to load both resources and
   leaves the converter uninitialised. Precache the current entry JS/CSS (or
   retain runtime cache entries safely), then verify update + offline reload.
3. **P2: Reject corrupt/undecodable image replacements.** The live app accepts
   invalid PNG bytes, calls them readable, shows a broken preview, and packs
   them without a warning/error recovery path.

## What was verified

- `npm ci` completed cleanly; `npm test` passed 8/8; `npm run build` passed;
  production-preview Playwright passed 6/6 once its standard Chromium browser
  was installed.
- Independent live ZIP checks preserved recipe text, notes, URL, attribution,
  and manifest; a 100-recipe JSON boundary import/export produced 100 folders
  and manifest entries. Invalid pasted JSON gave a specific error and
  recovered with valid input.
- Desktop and 390px mobile had no horizontal overflow; keyboard skip/focus and
  reduced motion work; live axe has zero serious/critical findings; no console
  or page errors occurred on valid conversion.
- Initial bundle budgets pass (15.72 KB gzip JS / 4.42 KB gzip CSS; 27.97 KB
  mobile hero). No first-load tracking or recipe uploads were observed.
- Live HTML, main JS, and service worker exactly match the locally built
  candidate. CSP, HSTS, referrer, permissions, immutable hashed assets, and
  no-cache service worker headers are live.

See [`.factory/verification.md`](verification.md) for commands, exact
reproduction evidence, severity rationale, and the outstanding 100-image
corpus validation gap. A fresh Lighthouse numeric run also remains required;
the verifier's Lighthouse CLI crashed against its supplied Chrome binary, so
only its underlying budget/accessibility checks are fresh evidence here.

## Re-run after fixes

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Repeat the live checkout request and the service-worker update followed by an
offline reload before changing this result to PASS.
