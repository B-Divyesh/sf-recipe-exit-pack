# Recipe Exit Pack — repair handoff

**Verification result: PASS (deployed)**

Base verified candidate: `291cc057c2529067620f83a1bad49244b859c912`

Independent report: `.factory/verification.md`

Repair work order: `recipe-exit-pack-repair-1`

## Repairs

1. **Archive Plus checkout is live.** On 2026-08-27, a fresh request to
   `https://api.sociobot.in/api/v1/products/recipe-exit-pack/checkout`
   returned HTTP **303** to a Sociobot/Dodo hosted checkout session. The
   product continues to use the required Sociobot billing URL; no payment
   provider was embedded in the static app.
2. **Offline-safe service-worker updates.** The production build now generates
   `dist/sw.js` from the Vite entry HTML. Its precache list contains the exact
   current hashed main JavaScript and CSS files as well as the offline shell.
   A browser regression test installs an initial worker, changes its cache
   version, asserts the new cache contains both current hashed entry assets,
   deletes the old cache through activation, then reloads and converts a recipe
   while offline.
3. **Unreadable images are rejected.** Image bytes are now decoded before a
   preview or export fallback is allowed. A corrupt replacement leaves the
   last valid image in place and gives recovery guidance. A corrupt matched
   import is removed from the recipe and cannot be packed; the recipe remains
   editable and users can choose a valid replacement.

## Exact verification evidence

All commands were run from a clean `npm ci` install on 2026-08-27.

```sh
npm ci                         # 100 packages, 0 vulnerabilities
npm test                       # 8/8 Vitest tests passed
npm run build                  # tsc --noEmit + Vite; dist/ produced
npx playwright install chromium
npm run test:e2e               # 9/9 passed
```

The browser suite covers the normal local import/edit/download flow, desktop,
390px layout, keyboard-accessible controls, legal landmarks, zero
serious/critical axe findings, first-install offline conversion, service-worker
update plus offline conversion, valid local image matching, and both corrupt
image regressions. It also records no console/page errors on the normal flow.

Additional production-build checks:

```sh
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ <evidence-dir>
# HTTP 200; title/lang/one h1/main/alt checks passed; no console/page errors

CHROME_PATH=/opt/pw-browsers/chromium-1234/chrome-linux64/chrome \
  npx lighthouse@13.4.1 http://127.0.0.1:4173/ \
  --chrome-flags='--headless --no-sandbox --disable-dev-shm-usage' \
  --only-categories=performance,accessibility
# Performance 100; Accessibility 100; LCP 1731.7505 ms; CLS 0
```

The Vite report records initial main JS at 15.83 KB gzip and CSS at 4.42 KB
gzip; the mobile hero remains within its 300 KB budget. Recipe processing and
storage remain browser-local; no new network or tracking dependency was added.
The standalone `@axe-core/cli` could not launch against the supplied Chrome /
ChromeDriver combination; the equivalent in-repository Playwright axe scan is
passing and is the accessibility evidence above.

## Deployment and live verification

Deployed the static `dist/` artifact to Azure Static Web Apps with
`/opt/fleet/lib/deploy-static.sh recipe-exit-pack dist` (deployment ID
`8284e28d-8abb-43a4-9586-45df68bf6416`).

Live verification at <https://recipe-exit-pack.sociobot.in/> passed on
2026-08-27: HTTP 200; page title, `lang=en`, one `h1`, `main`, and image alt
checks passed; no browser console/page errors at desktop or 390px. SHA-256
matched both deployed `main-CawpKxfw.js` and `sw.js` to the locally built
artifact. Live CSP, HSTS, referrer, permissions, and nosniff policies are
present; hashed assets are immutable and `sw.js` is `no-cache`. The live
checkout endpoint returns HTTP 303 to a Dodo checkout session.

## Run and deploy

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
/opt/fleet/lib/deploy-static.sh recipe-exit-pack dist
```

## Known non-blocking gap

The existing 100-recipe test validates textual fidelity but does not use a
licensed corpus of 100 distinct recipe images, so the brief’s image-success
rate still needs a corpus-based acceptance run. This repair preserves all
previously passing import/export behavior and adds no known release blocker.
