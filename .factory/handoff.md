# Review 2 handoff — Recipe Exit Pack

## Delivered

Independent adversarial review recorded in `.factory/review-2.md`. No product code, configuration, or product assets were modified.

## Verification run

- Opened the deployed site in fresh 390 × 844 and 1440 × 1000 Chromium contexts.
- Checked the real `/demo/` flow, reset, Start for real, IndexedDB namespace isolation, request origins, titles, metadata, 404, route behavior, focus, and links.
- From a fresh clone: `npm ci`, `npm test`, `npm run build`, then every command in `.factory/claims.json` individually. All six declared claim commands passed.
- Crawled all site links and inspected all previous review/handoff material.

## Result / remaining work

Review verdict is **FAIL**. The blocking issue is that mobile `/demo/` opens on a marketing hero; the populated sample workbench starts below the first viewport, contrary to the one-click demo requirement. Additional high findings cover unregistered claims and focus/announcement failures on legal/404 routes. See `.factory/review-2.md` for exact evidence and concrete fixes.

## Re-run

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Then run every test command in `.factory/claims.json` from a fresh clone and repeat the live 390px `/demo/` check.
