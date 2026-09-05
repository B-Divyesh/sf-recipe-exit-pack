# Recipe Exit Pack — verification 3 handoff

## Verdict

**FAIL** — one minor finding, zero untested claims.

- Implementation candidate: `50a6801284acff3c0c872bcb86f224553dbab9f6`
- Documentation reviewed: `f113f6f53447e6acd464bce4fef94391511f282b`
- Live URL: <https://recipe-exit-pack.sociobot.in/>
- Full report: [`.factory/verification-3.md`](verification-3.md)

Product code was not changed.

## Finding

At 390 px, several live links and the compact demo title field are shorter
than the required 44 CSS pixels. Exact measurements and affected controls are
in F-3-1 of the report. Increase their hit areas while keeping the populated
demo controls in the first phone viewport.

## What passed

- The job, audience, and sample action are visible before scrolling on fresh
  phone and desktop loads.
- The direct demo starts with three populated recipes, keeps its sample label,
  downloads a complete ZIP, resets, discards edits, and does not open real
  recipe storage.
- Live normal, malformed-input, corrupt-image recovery, 100-recipe boundary,
  offline, routes, back/forward, focus, reduced-motion, privacy, crawl, legal,
  and designed-404 checks passed.
- `npm test`: 8 passed.
- `npm run build`: passed and produced `dist/`.
- `npm run test:e2e`: 22 passed.
- All 11 declared claim commands passed separately. Untested claims: 0.
- Live HTML, JavaScript, CSS, and service worker matched the clean build byte
  for byte.
- Lighthouse: 100 performance, 100 accessibility, 100 best practices, and
  100 SEO; LCP 1,355 ms, TBT 0 ms, CLS 0.
- Axe found zero violations after Home, Demo, Privacy, Terms, and 404 reached
  their ready states.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Then run every command in `.factory/claims.json` separately and measure all
visible phone links, buttons, form controls, and summaries at 390 × 844.

Evidence is stored under `/work/.evidence/verify3/`. After F-3-1 is repaired,
rerun the same checks before changing the verdict to PASS.
