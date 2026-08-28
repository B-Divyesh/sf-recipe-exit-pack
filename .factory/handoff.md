# Review handoff — 2026-08-28

## Done

- Performed the requested adversarial first-read review without modifying product code.
- Added `.factory/review-1.md` with the FAIL verdict, reproducible findings, copy audit, and acceptance retest steps.

## Verification run

- Fresh live Chromium contexts at 390 × 844 and 1440 × 1000; no console errors.
- Live checks for home, privacy, terms, `/demo`, `?demo=1`, missing route, robots, sitemap, and checkout.
- Clean clone at `8072183c3321e9691c8fc374c8ce9e622e770d45`: `npm ci`, `npm test` (8 passed), `npm run build` (passed).
- Repository after build: `npm run test:e2e` (9 passed).

## Known gaps / next steps

- **FAIL:** no one-click isolated demo, no `.factory/claims.json`/tagged claim tests, unclear cold first screen, and `/demo`/404 routing to home.
- See `.factory/review-1.md` for exact evidence and fixes.
