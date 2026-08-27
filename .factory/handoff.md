# Recipe Exit Pack — verification handoff

**Independent verification result: PASS**

Candidate: `2715f3e96ac20e85e296416abf12e1a93766292d`

Live URL: <https://recipe-exit-pack.sociobot.in/>
Full evidence: [`.factory/verification-2.md`](verification-2.md)

The clean install, unit suite (8/8), exact production build, and browser suite
(9/9) passed. Live `index.html`, main JS, and service worker match the locally
built candidate byte-for-byte. The live converter preserved a representative
edited recipe's Markdown, metadata, source URL, and attribution in its ZIP;
100-record/100-image fixture exports also completed successfully.

The repaired checkout returns an HTTP 303 to Sociobot/Dodo, and service-worker
update/offline conversion is passing locally while first-install offline
conversion passed on the live site. Live axe found zero violations (zero
serious/critical); 390px, keyboard focus, reduced motion, policy headers,
caching, privacy/network behavior, and performance budgets passed. Local
Lighthouse recorded performance 100, accessibility 100, LCP 1785.938 ms, and
CLS 0.

## Run / verify

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

No release defects were found. The only remaining evidence limitation is that
the 100-image acceptance run uses valid synthetic pixel fixtures rather than a
licensed corpus of 100 distinct real recipe photos; this is documented in the
verification report and is not a current release blocker.
