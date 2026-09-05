# Turn recipe app exports into a ZIP — verification 3

**Verdict: FAIL**

Verified on 5 September 2026 against
<https://recipe-exit-pack.sociobot.in/>.

- Implementation candidate: `50a6801284acff3c0c872bcb86f224553dbab9f6`
- Documentation reviewed: `f113f6f53447e6acd464bce4fef94391511f282b`
- Findings: **1 minor**
- Untested claims: **0**

No product code was changed. PASS requires zero findings, so the touch-target
finding below makes this verification a FAIL even though every functional and
claim test passed.

## Cold first screen

Fresh 390 × 844 and 1440 × 1000 browser contexts answered the required
questions before scrolling:

- Job: **Turn recipe app exports into a ZIP.**
- Audience: people leaving a recipe app who want recipes, photos, notes, and
  source links in files they control.
- First action: **Try it with sample data.**

All three items were inside the initial viewport at both sizes. Neither page
had horizontal overflow or a console/page error.

## Finding

### F-3-1 — MINOR — Phone touch targets are shorter than 44 CSS pixels

The attached accessibility and design contracts require touch targets of at
least 44 × 44 CSS pixels. A fresh 390 × 844 touch context measured these live
targets below that height:

- App header and footer wordmarks: 153.4 × 30 px.
- Footer links: Demo 44.5 × 24.8 px, Privacy 56.9 × 24.8 px, and Terms
  46.8 × 24.8 px.
- Demo title field: 328 × 42.8 px.
- Privacy and Terms contact links: 70.7 × 17 px.
- 404 return link: 124 × 17 px.

The controls remain usable and have adequate width, so this is minor rather
than a blocked task. It is still a contract finding. Give each link a minimum
44 px hit area and remove the demo-only title-field rule that reduces the
control below 44 px. Recheck the compact demo viewport after changing spacing.

## Live product checks

### Demo and recipe ZIP

The landing action opened `/demo/`. In the first phone viewport, the persistent
sample banner, all three named recipes, the editable title, and **Download
recipe ZIP** were visible. The recipe buttons began at y=335.9 px, the title at
y=469.1 px, and download at y=563.9 px.

Editing **Weeknight lemon pasta** persisted while switching recipes. The live
download contained three `recipe.md` files, three `metadata.json` files, the
matched photo, `manifest/sources.md`, and `manifest/recipes.json`. The edited
title was present in the downloaded recipe. The source list retained the URL,
author, notes, and imported filename.

The sample label stayed visible through editing and download. **Reset demo**
restored **Weeknight lemon pasta**. **Start for real** opened an empty converter,
left localStorage empty, and did not open a real-data database. Returning to
the demo loaded the original sample, proving that the edited demo was
discarded. The only IndexedDB name opened during the sample was
`demo:recipe-exit-pack`.

The complete phone sample flow made same-origin requests only. No recipe,
analytics, font, or AI request left the product origin.

### Normal, invalid, boundary, and recovery paths

- Normal: the edited sample downloaded and all promised archive entries were
  readable.
- Invalid: malformed JSON reported **“Unexpected end of JSON input”** with a
  corrective error message.
- Recovery: replacing the malformed content imported **Recovery toast**.
  A corrupt PNG was rejected, no broken preview was kept, and a valid
  replacement decoded with `naturalWidth` 1.
- Boundary: a 100-recipe JSON export produced 100 recipe folders and 100
  manifest records; the first and last titles were preserved.
- Offline: after the first successful visit, a fresh installed demo reloaded
  offline and accepted an edit.
- Update: the clean browser suite verified that a service-worker update
  precaches the current hashed JavaScript and CSS before offline reload.

### Routes, keyboard, accessibility, and links

- Home, Demo, Privacy, Terms, and 404 each had the correct route title,
  `lang=en`, one h1, one main landmark, metadata, focused h1, and polite route
  announcement.
- Navigation, back, and forward restored the correct route, title, heading
  focus, and announcement.
- The skip link was keyboard reachable with a visible 4 px blue outline. The
  closed **Paste one recipe instead** control opened with Enter and closed with
  Space. No keyboard trap was observed.
- Reduced-motion mode changed the primary-action transition from 160 ms to
  effectively zero.
- Axe scans after each page reached its ready state found zero violations on
  Home, Demo, Privacy, Terms, and 404. The touch-size issue above is a manual
  contract check not reported by this axe configuration.
- Every crawled internal link returned 200. The external `sociobot.in` contact
  link returned 200.
- A made-up route returned the intended HTTP 404 with the designed page,
  correct title, focused h1, announcement, and a return link. The browser's
  404 resource message is expected evidence of that response, not a defect.

The live headers include HSTS, a self-only CSP, `frame-ancestors 'none'`,
`nosniff`, strict-origin referrer policy, and disabled camera, microphone, and
geolocation permissions. Hashed assets are immutable; `sw.js` is `no-cache`.

## Claims

From a separate clean checkout at the documentation commit, after `npm ci`,
every command in `.factory/claims.json` was run separately and passed:

| Claim | Result |
| --- | --- |
| `recipe-zip-content` | PASS — 1 test |
| `demo-isolation` | PASS — 1 test |
| `offline-after-first-visit` | PASS — 1 test |
| `no-recipe-uploads` | PASS — 1 test |
| `no-tracking` | PASS — 1 test |
| `free-download` | PASS — 1 test |
| `demo-sample-recipes` | PASS — 1 test |
| `supported-inputs` | PASS — 1 test |
| `source-list-fields` | PASS — 1 test |
| `matched-photos` | PASS — 1 test |
| `review-before-download` | PASS — 1 test |

There are 11 registered claims and exactly 11 unique claim tags. A fresh audit
of the landing page, interaction copy, README, Privacy, and Terms found no
untested public product claim. **Untested claim count: 0.**

## Clean checkout and live parity

```text
npm ci             PASS — 100 packages, 0 vulnerabilities
npm test           PASS — 8 tests
npm run build      PASS — dist/ produced
npm run test:e2e   PASS — 22 tests
```

Initial main JavaScript is 15.97 KB gzip and CSS is 4.70 KB gzip. No font file
is loaded. The optional 341.28 KB gzip HEIC decoder is a lazy chunk and is not
part of the first load.

Fresh mobile Lighthouse completed successfully: performance 100,
accessibility 100, best practices 100, and SEO 100. Measured LCP was 1,355 ms,
total blocking time 0 ms, and CLS 0.

SHA-256 and byte comparison matched the live `index.html`, main JavaScript,
main CSS, and `sw.js` to the clean build. The live footer also reports build
`50a6801`, so the deployed runtime is the implementation candidate.

## Earlier findings

| Earlier area | Current disposition |
| --- | --- |
| Review 1: unclear job, audience, and action | Fixed and visible before scrolling on phone and desktop. |
| Review 1: missing one-click isolated demo | Fixed; direct demo, persistent label, reset, discard, offline, and isolated storage all passed. |
| Review 1: missing claims | Fixed; 11 of 11 declared claim commands passed separately. |
| Review 1: routes, metadata, 404, and shared structure | Fixed; direct routes, titles, metadata, focus, announcements, crawl, and intended 404 passed. |
| Review 1: unclear names and jargon | Fixed in the current landing copy and README. |
| Verification 1: checkout and license path | Paid claims and code were deliberately removed; the complete local conversion remains free. |
| Verification 1: service-worker update | Fixed; update-then-offline regression passed. |
| Verification 1: corrupt image handling | Fixed; live rejection and recovery passed. |
| Review 2 F-2-1: demo below the phone fold | Fixed; populated recipe controls and download are in the first viewport. |
| Review 2 F-2-2 through F-2-5 and F-2-8: unproved sample, inputs, sources, photo, and review claims | Fixed; each has a passing claim test and live outcome evidence. |
| Review 2 F-2-6, F-2-7, F-2-9, F-2-10: paid/free assertions | Fixed; unsupported paid copy was removed and free download is tested. |
| Review 2 F-2-11: static-route focus | Fixed on direct load, navigation, back, and forward. |
| Review 2 F-2-12: README storage jargon | Fixed with plain separate-sample wording. |

The new F-3-1 touch-target issue is the only current finding.

## Evidence and next step

Browser JSON, desktop and phone screenshots, the downloaded live ZIP, URL
checker output, and Lighthouse JSON are under `/work/.evidence/verify3/`.

Increase the listed phone hit areas to at least 44 × 44 CSS pixels, preserve
the first-screen demo layout, and rerun the touch-target scan plus the existing
quality and claim commands. No backend checks apply to this static product.
