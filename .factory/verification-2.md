# Recipe Exit Pack — independent verification 2

**Result: PASS**

Verified on 2026-08-27 from a clean checkout at candidate commit
`2715f3e96ac20e85e296416abf12e1a93766292d` against
<https://recipe-exit-pack.sociobot.in/>. Product source was not modified by
this verification.

## Release decision

The two earlier release blockers are fixed and are present on the live site:

- The Archive Plus checkout endpoint returned **HTTP 303** to a Sociobot/Dodo
  checkout session. Invalid-license verification returned HTTP 200 with
  `{ "valid": false, "reason": "invalid" }`; no payment was attempted.
- The generated service worker precaches the current hashed main JavaScript
  and CSS. The repository update/offline regression test passed, and a fresh
  live install cached those files then reloaded and converted a recipe while
  offline without console or page errors.

## Clean-build evidence

```sh
npm ci                         # 99 packages installed; 0 vulnerabilities
npm test                       # 8/8 Vitest tests passed
npm run build                  # tsc --noEmit + Vite passed; dist/ produced
npx playwright install chromium
npm run test:e2e               # 9/9 passed from production preview
```

There is no lint script or lint configuration in this repository. Type
checking is part of the exact production build command.

Vite reported the optional lazy HEIC decoder at 1.35 MB raw / 341.28 KB gzip,
but it is not an initial request. Initial main JS is 37.64 KB raw / **15.83 KB
gzip**, CSS is 17.30 KB raw / **4.42 KB gzip**, font bytes are zero, and the
mobile hero WebP is 27.97 KB: all applicable initial-load budgets pass.

Local mobile Lighthouse (Chrome 151, production preview) was **100
performance / 100 accessibility**, LCP **1785.938 ms**, CLS **0**. This is a
local controlled measurement, not a claim about field performance.

## Product-flow evidence

- A live pasted recipe was edited and downloaded. Its ZIP contained
  `recipe.md`, `metadata.json`, `manifest/sources.md`,
  `manifest/recipes.json`, and `README.txt`; title, ingredients, directions,
  notes, source URL, and attribution were all preserved in the Markdown and
  manifests. No browser console or page errors occurred. The same flow passed
  from the locally built artifact.
- Live ZIP, `.melarecipes`, `.paprikarecipes`, and gzipped
  `.paprikarecipe` fixture inputs imported as four named recipes with source
  URLs. This exercises the documented archive paths rather than only pasted
  text.
- Boundary run: a 100-record JSON export produced 100 recipe folders and 100
  manifest records; the first and last records retained their titles, notes,
  and source URLs. A second 100-recipe input with explicitly matched valid PNG
  fixtures produced **100 matched images** and **100 normalized, non-empty
  WebP files** in the live ZIP.
- Invalid/recovery paths passed: malformed pasted JSON showed a specific parse
  error and was immediately replaceable with valid input. The browser suite
  confirms corrupt matched images are skipped and corrupt replacement images
  leave the previous readable image intact with corrective guidance.
- Normal local image matching, remove/undo, desktop layout, legal-page
  landmarks, first-install offline conversion, and update-then-offline
  conversion are covered by the 9 passing browser tests.

## Live artifact, privacy, security, and accessibility

- SHA-256 and `cmp` matched live `index.html`,
  `assets/main-CawpKxfw.js`, and `sw.js` exactly to this candidate's `dist/`
  output. The live main bundle is therefore the tested candidate, not merely a
  similarly named deployment.
- A normal live conversion requested only the site origin: no analytics,
  third-party fonts/scripts, recipe uploads, or automatic cross-origin calls.
  Static inspection confirms the only optional cross-origin activity is the
  user-initiated Sociobot checkout/license verification. Recipe work stays in
  the browser; free work is tab-only and Plus persistence is documented local
  IndexedDB/localStorage.
- Live headers include HSTS, CSP (`script-src 'self'`, self-only images/styles
  plus the allowed Sociobot API connect target), `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a
  disabled camera/microphone/geolocation permissions policy. Hashed assets
  are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`.
- The factory URL checker returned HTTP 200 with title, `lang=en`, one `h1`,
  `main`, image-alt, and no browser/page-error failures. Live Playwright axe
  found **0 violations** (therefore **0 serious/critical**).
- At 390px there was 0px horizontal overflow; the first keyboard focus was the
  skip link with a 4px visible outline. Reduced-motion transition duration was
  `0.00001s`, and keyboard operation reached the conversion controls without a
  trap. The matching local test suite also covers the 390px layout.

## Defects by severity

No P0, P1, P2, or P3 defects were found in this candidate.

## Acceptance limitation (not a release defect)

The 100-image run used generated valid one-pixel PNG fixtures to verify the
complete matching, WebP-normalization, and ZIP paths. It demonstrates the
brief's 100-record preservation mechanics, but is not a licensed corpus of
100 distinct real recipe photographs. A representative real-export corpus
would still be useful for measuring the brief's user-study success metric,
but no product failure was observed.

## Re-run

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Then validate the live hashes, checkout redirect, live end-to-end ZIP, and
offline reload described above.
