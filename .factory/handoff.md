# Recipe Exit Pack — repair 2 handoff

## Release status

Implementation candidate: `e1376625c0a548a273be14e830e38c1cdb9682ad`.

This repair makes the sample route start in the populated workbench, removes
unproved purchase claims, and proves the remaining public outcomes with the
demo sandbox. The documentation/report commit follows this implementation
candidate; it does not change the product behaviour.

## What changed

- `/demo/` moves its only heading into a compact workbench view, hides the
  marketing hero and import path, and keeps the demo banner, three named
  recipes, selected title, and **Download recipe ZIP** visible at 390 × 844.
- Added outcome-based claims and browser coverage for the three-recipe sample,
  ZIP/JSON/HTML/text/image imports, source-list fields, readable matched
  photos, and editing before download. The source list now includes supplied
  notes as promised.
- Removed the Archive Plus pitch, price, merchant, and license assertions
  because those purchase outcomes were not sandbox-verifiable. Core import,
  review, and ZIP download remain free and local.
- Removed the unused license network path and narrowed the CSP to same-origin
  connections. The product makes no cross-origin runtime request.
- Added the shared static-route focus script. Privacy, Terms, 404, and a
  missing-route response now have a focusable focused h1 and a polite route
  announcement.
- Rewrote README storage wording without implementation jargon, completed the
  copy audit, and copied the verb-first catalog description to
  `/work/.evidence/catalog-description.txt`.

## Review disposition

| Review 2 finding | Current disposition |
| --- | --- |
| F-2-1 mobile demo starts with marketing | Fixed; a 390px browser claim asserts named samples, editable title, and ZIP download are in the initial viewport. |
| F-2-2 three sample recipes | Fixed; `demo-sample-recipes` claim. |
| F-2-3 supported input formats | Fixed; `supported-inputs` imports ZIP, JSON, HTML, text, and a matched PNG fixture. |
| F-2-4 source-list fields | Fixed; notes are exported and `source-list-fields` verifies URL, author, notes, and filename. |
| F-2-5 readable matched photo | Fixed; `matched-photos` decodes downloaded image bytes and checks the recipe-folder path. |
| F-2-6 through F-2-10 purchase/free-flow assertions | Unsupported paid statements removed. The retained free-download statement has its own claim test. |
| F-2-8 review before download | Fixed; `review-before-download` edits a sample and checks the downloaded recipe text. |
| F-2-11 static route focus | Fixed and covered by direct loads, header navigation, live announcements, and static-route axe checks. |
| F-2-12 README storage jargon | Fixed; README uses the plain separate-sample statement. |

All review-1 work remains in place: real demo route and isolation, metadata,
designed 404, shared skeleton, generated-art provenance, service-worker update
coverage, corrupt-image recovery, and local-first ZIP conversion.

## Verification

From a fresh clone at the implementation candidate, after `npm ci`:

```sh
npm test                 # 8 passed
npm run build            # passed; dist/ produced
npm run test:e2e         # 22 passed
```

Every command in `.factory/claims.json` passed separately from that clean
clone: `recipe-zip-content`, `demo-isolation`, `offline-after-first-visit`,
`no-recipe-uploads`, `no-tracking`, `free-download`,
`demo-sample-recipes`, `supported-inputs`, `source-list-fields`,
`matched-photos`, and `review-before-download`.

Fresh 390 × 844 and 1440 × 1000 Chromium contexts had no console or page
errors and no horizontal overflow. On the landing page, before scrolling: the
job is converting a recipe-app export into a ZIP; the audience is people
leaving a recipe app; and the first action is **Try it with sample data**. On
the phone demo, named sample recipes, the selected title, and the download
button are all above y=612 in an 844px viewport.

The browser suite includes axe checks for landing, Privacy, Terms, and 404;
there are no serious or critical violations. Initial app JS is 15.97 KB gzip,
CSS is 4.70 KB gzip, no font files are loaded, and the 720px hero WebP is
27.97 KB. The optional HEIC decoder remains a lazy chunk and is not in the
initial load.

## Run and deploy

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
```

Open `/demo/` for the isolated sample. Deploy the generated `dist/` folder to
Azure Static Web Apps using the committed static deployment configuration.

## Known limits

- The product cannot independently establish the brief's user-study success
  rate without a representative, permissioned 100-recipe export corpus. The
  automated suite does exercise 100 textual records and the complete matched
  image path, but not a real-world user study.
- The optional HEIC decoder is intentionally lazy. Its 341 KB gzip chunk only
  downloads when a user supplies HEIC content.
