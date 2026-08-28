# Adversarial first-read review 2 — Recipe Exit Pack

**Verdict: FAIL**

Reviewed 2026-08-28 against `https://recipe-exit-pack.sociobot.in` and source commit `fc467337169cc2336cbb2c67880e1fffc0b7ef83`. This review made no product-code changes.

## Cold read

Fresh Chromium contexts at 390 × 844 and 1440 × 1000 loaded the landing page. Before scrolling, I can answer all three required questions: it converts a recipe-app export into a recipe ZIP; it is for people leaving a recipe app who want their recipes, photos, notes, and source links in files they control; and the first click is **“Try it with sample data.”** The adjacent line says it will show three sample recipes ready to review and download.

The first screen is clear on both viewport sizes. There were no console errors, horizontal overflow at 390px, or third-party requests during the landing/demo flow observed in the fresh live contexts.

## Findings

### F-2-1 — BLOCKING — The mobile demo does not show the product being used in its first screen

**Location / exact text:** `/demo/`, 390 × 844: **“Try the sample recipe ZIP”**, **“See three sample recipes ready to review and download.”**, and the persistent **“Demo — sample data, nothing is saved”** banner. The visible first viewport contains no recipe name, recipe list, editor, ingredients, source link, or download result.

**Evidence:** In a fresh mobile browser context, the loaded demo workbench begins at y=2141px and is not visible in the initial 844px viewport. The sample data is genuinely loaded below it: the first selected title is “Weeknight lemon pasta” and the queue contains three named recipes.

**Why this fails:** The demo requirement is not merely a demo URL. The first screen *after clicking* must already show realistic sample data and the product in use. A visitor instead sees a second marketing hero and must scroll roughly 2.5 screens to discover whether the demo contains anything.

**Concrete fix:** Give `/demo/` a demo-first layout: place the persistent banner above a compact heading and put the populated recipe queue, selected recipe, and **“Download recipe ZIP”** in the initial mobile viewport. Remove the duplicate “See three sample recipes…” line and the empty **“Choose recipe export”** path from demo mode. Add a 390px Playwright assertion that a named sample recipe and the ZIP download action are visible without scrolling after entering `/demo/`.

### F-2-2 — HIGH — The asserted three-recipe sample is not registered or tested as a claim

**Location / quote:** Landing action note: **“See three sample recipes ready to review and download.”**

**Why this misleads:** The number and readiness are useful promises to a visitor, but no `.factory/claims.json` entry covers them. `demo-isolation` checks a title and reset/isolation, not that all three samples are immediately usable.

**Concrete fix:** Add a `demo-sample-recipes` claim and tagged test from a fresh `/demo/` context that asserts the three named recipes, selected editable fields, and an enabled download action. Alternatively remove the number from the copy.

### F-2-3 — HIGH — Supported input formats are an unlisted claim

**Location / quote:** Converter: **“Common ZIP, JSON, HTML, text, and recipe-image files work here.”**

**Why this misleads:** Visitors may choose this tool based on whether their export format is accepted. No claims entry or one-claim test proves the listed formats; the existing general tests cover JSON and one image only.

**Concrete fix:** Register the precise supported formats that are guaranteed and add one `@claim:` test that imports representative ZIP, JSON, HTML, text, and image fixtures and verifies the observable parsed output. Remove formats that are not covered by the test.

### F-2-4 — HIGH — Source-list field preservation is an unlisted, under-tested claim

**Location / quote:** Format section: **“Recipe source links, authors, notes, and imported filenames appear in the source list.”**

**Why this misleads:** The current ZIP-content claim tests only that one author appears in `sources.md`. It does not prove links, notes, or original filenames, despite the page promising all four.

**Concrete fix:** Add a dedicated claim/test that downloads the demo ZIP and checks each promised field in the source list, or shorten the sentence to the fields the existing claim test actually proves.

### F-2-5 — HIGH — Photo inclusion/readability is an unlisted claim

**Location / quote:** Format section: **“Matched readable photos are included beside their recipe.”** README repeats **“Matched readable photos beside their recipe.”**

**Why this misleads:** The output claim asserts that the ZIP contains “photos,” but its test only checks an `image.png` entry exists. It does not establish that the entry is a readable image or that it corresponds to a matched sample recipe.

**Concrete fix:** Add a `matched-photos` claim/test that opens the downloaded image bytes with a decoder and verifies its recipe-folder association; otherwise say only that the ZIP can include an image file.

### F-2-6 — HIGH — The free import-and-edit promise has no claim test

**Location / quote:** Paid section: **“The free converter imports, edits, and downloads recipe ZIPs.”**

**Why this misleads:** `free-download` proves a download is allowed without a stored license. It does not prove the all-three-part free flow stated here: import, edit, then export.

**Concrete fix:** Add a `free-core-flow` claim/test in an unlicensed fresh context that imports a fixture, edits a visible field, downloads, and checks that edit in the archive. Keep `free-download` only if its narrower statement remains visible.

### F-2-7 — HIGH — Archive Plus capabilities are unlisted claims

**Location / quote:** **“Archive Plus adds saved work, duplicate hints, and notes-app fields.”** README repeats **“It adds saved work, duplicate hints, and notes-app fields.”**

**Why this misleads:** These are three distinct purchase-relevant capabilities. None has a claim entry or a recorded-fixture test. The visitor cannot tell what “saved work” or “notes-app fields” does from the page either.

**Concrete fix:** State each capability concretely, register each promised outcome, and test it with a recorded valid-license fixture: reopen saved work, expose a duplicate hint for matched title/source data, and verify the additional exported fields. If those tests are not available, remove the capability list from the paid pitch.

### F-2-8 — HIGH — The README promises a review screen without a corresponding claim

**Location / quote:** README, “What you get”: **“A review screen before download”**.

**Why this misleads:** This is a user-facing workflow promise, but it is not in `claims.json`. Existing tests happen to use the editor; none is the required observable claim test for review-before-download.

**Concrete fix:** Add a `review-before-download` entry/test that verifies imported demo/fixture data is editable before a ZIP can be downloaded, or remove the bullet.

### F-2-9 — HIGH — The merchant-of-record statement is an unlisted claim

**Location / quote:** Paid section: **“Sociobot / Dodo is the merchant of record.”** README also says **“Checkout, when used, is hosted by Sociobot / Dodo; no payment-provider script is included here.”**

**Why this misleads:** This is a reliance-bearing payment/legal assertion with no `claims.json` entry or test. A URL crawl reaching a checkout endpoint does not establish merchant-of-record status.

**Concrete fix:** If the legal statement is required, document the authoritative contractual source and link it from Terms. For landing copy, use the testable statement **“Checkout opens with Sociobot / Dodo.”** and add a navigation test, or remove it from the product pitch.

### F-2-10 — HIGH — The paid price and license terms are unlisted claims

**Location / quote:** **“Archive Plus — $9 once”**, **“One-time purchase, no subscription”**, and **“Restore a license on your devices.”**

**Why this misleads:** Price, subscription status, and device-restoration rights are purchase-relevant facts. None is listed in `claims.json` or proved by its tagged tests. The free-download test does not establish them.

**Concrete fix:** Add separate price/checkout, non-subscription, and license-restoration claims with observable tests or official contractual evidence. Remove any statement that cannot be verified in the sandbox/checkout fixture.

### F-2-11 — HIGH — Legal and 404 route changes lose keyboard/screen-reader focus

**Location / evidence:** Navigating from the home header’s **“Privacy”** link leaves `document.activeElement` on `<body>` on `/privacy/`. Direct loads of `/privacy/`, `/terms/`, `/404/`, and a missing route do the same. Those pages have neither a route announcement nor a focusable/focused `<h1>`; only the home and demo scripts focus `#hero-title`.

**Why this fails:** A user who activates a real link receives no programmatic indication that the page changed. This fails the required route-change focus and live-announcement behavior even though titles, h1s, and back navigation otherwise work.

**Concrete fix:** Make the legal and 404 `<h1>` elements programmatically focusable, focus them on load without scrolling, and provide an `aria-live="polite"` route announcement. Add browser tests for direct navigation, header navigation, back, and each static route’s focused heading.

### F-2-12 — MINOR — README exposes storage implementation jargon in its user-facing description

**Location / quote:** README: **“The demo uses separate `demo:` IndexedDB storage and never opens the real workbench or license storage.”**

**Why this is unclear:** “IndexedDB” and a key prefix are implementation terms. They do not help a recipe owner decide whether the sample is safe.

**Concrete fix:** Replace the README sentence with **“The sample is stored separately on this device and never opens your real recipes or license.”** Keep the exact `demo:` database name in `.factory/demo.md`, where verifiers need it.

## Copy audit

All sentence-level landing and README copy is listed below. Counts treat words/numbers as tokens and URLs/code identifiers as one token. No listed sentence exceeds 22 words. Sentence-length therefore creates no finding; the jargon finding is F-2-12. Headings and controls were also checked: the result-naming controls (**“Try it with sample data”**, **“Choose recipe export”**, **“Download recipe ZIP”**, **“Reset demo”**, **“Start for real”**) are clear verbs, and no landing heading is contextless.

### Landing page sentences

| Words | Sentence / location |
| ---: | --- |
| 6 | Hero caption: “Your files stay in this browser.” |
| 5 | Hero caption: “You download the recipe ZIP.” |
| 18 | Hero: “For people leaving a recipe app who want recipes, photos, notes, and source links in files they control.” |
| 9 | Hero action note: “See three sample recipes ready to review and download.” |
| 6 | Converter intro: “Choose files or paste one recipe.” |
| 8 | Converter intro: “Review the results, then download your recipe ZIP.” |
| 8 | Import panel: “Choose an app export or paste one recipe.” |
| 10 | Import panel: “Common ZIP, JSON, HTML, text, and recipe-image files work here.” |
| 9 | Paste hint: “Use headings for ingredients, directions, notes, and source links.” |
| 14 | Pack panel: “Your ZIP includes recipe text files, a data file, photos, and a source list.” |
| 6 | Format intro: “Each recipe has its own folder.” |
| 15 | Format intro: “The ZIP includes recipe text, a data file, photos, and a list of source links.” |
| 15 | Recipe text card: “Each recipe folder includes a recipe text file you can open in a text editor.” |
| 13 | Source list card: “Recipe source links, authors, notes, and imported filenames appear in the source list.” |
| 8 | Photo card: “Matched readable photos are included beside their recipe.” |
| 9 | Paid section: “The free converter imports, edits, and downloads recipe ZIPs.” |
| 10 | Paid section: “Archive Plus adds saved work, duplicate hints, and notes-app fields.” |
| 7 | Merchant note: “Sociobot / Dodo is the merchant of record.” |
| 7 | Footer: “Convert recipe exports into files you control.” |
| 8 | Footer: “Hero illustration generated with AI for this product.” |

Hidden/interaction state sentences carried by the landing shell were also counted: **“Changes stay in a separate sample workspace.”** (7), **“No recipes match that filter.”** (6), **“Add an image if your export did not include one.”** (10), **“Building your archive locally…”** (4), and **“Recipe removed.”** (2). They are all under the cap.

Short, non-sentence claim fragments also present are **“Recipe files stay on this device”**, **“Recipe ZIP download stays free”**, **“Works offline after first visit”**, **“No recipe uploads”**, and **“No tracking.”** They map to the declared privacy/free/offline claims; product names, navigation, labels, folder names, and build disclosure are labels rather than sentences.

### README sentences and bullet copy

| Words | Sentence / location |
| ---: | --- |
| 11 | Intro: “Convert recipe app exports into a recipe ZIP on your device.” |
| 21 | Intro: “It is for people leaving a recipe app who want recipe text, photos, notes, and source links in files they control.” |
| 10 | Intro: “Try the one-click sample at https://recipe-exit-pack.sociobot.in/demo/.” |
| 12 | What you get: “A recipe text file and a data file for every imported recipe” |
| 6 | What you get: “Matched readable photos beside their recipe” |
| 11 | What you get: “A source list with supplied links, authors, notes, and imported filenames” |
| 5 | What you get: “A review screen before download” |
| 7 | What you get: “Offline use after the first successful visit” |
| 7 | Privacy: “Recipe files are processed in the browser.” |
| 16 | Privacy: “The demo uses separate `demo:` IndexedDB storage and never opens the real workbench or license storage.” |
| 7 | Paid option: “Archive Plus is a one-time $9 option.” |
| 9 | Paid option: “It adds saved work, duplicate hints, and notes-app fields.” |
| 5 | Paid option: “Recipe ZIP download stays free.” |
| 6 | Run locally: “Requires Node.js 20 or newer.” |
| 7 | Run locally: “Open the local address printed by Vite.” |
| 9 | Run locally: “Use `/demo/` to start with the shipped sample recipes.” |
| 12 | Test/build: “Run every command listed in `.factory/claims.json` from a clean clone.” |
| 18 | Test/build: “`npm run build` creates `dist/` with the app, legal pages, demo route, service worker, and static deployment configuration.” |
| 7 | Deploy: “Deploy `dist/` to Azure Static Web Apps.” |
| 14 | Deploy: “Checkout, when used, is hosted by Sociobot / Dodo; no payment-provider script is included here.” |
| 2 | Closing: “MIT licensed.” |
| 9 | Closing: “Process only recipe content you are allowed to copy.” |

## Claims and sandbox verification

`.factory/claims.json` exists and contains six entries. From a fresh clone of the reviewed commit, `npm ci`, `npm test` (8 tests), and `npm run build` completed successfully. Each declared command passed individually:

| Claim id | Result |
| --- | --- |
| `recipe-zip-content` | PASS |
| `demo-isolation` | PASS |
| `offline-after-first-visit` | PASS |
| `no-recipe-uploads` | PASS |
| `no-tracking` | PASS |
| `free-download` | PASS |

The claim tests use a fresh `/demo/` entry point. The offline test reloads after the service worker is ready and edits a demo recipe while offline. The network-interception tests permit only the local same-origin preview server. A separate live-browser request log for the demo saw only `https://recipe-exit-pack.sociobot.in` requests. In a live context, changing a sample then allowing reset to complete restored “Weeknight lemon pasta”; only `demo:recipe-exit-pack` was opened, and **Start for real** discarded the demo and returned to an empty real workbench. These checks confirm sandbox isolation, but do not cure F-2-1 or the unlisted claims.

## History verification

All earlier material was read: `.factory/review-1.md` and `.factory/handoff.md`; no `.factory/polish-*.md` files exist.

| Review-1 area | Live/code confirmation |
| --- | --- |
| Cold first screen | Fixed: the job, audience, and sample action are explicit at 390px and desktop. |
| Demo URL, banner, reset, isolation | Implemented and operational: `/demo/` has its own title/canonical, three samples, banner, reset, separate `demo:` storage, and return-to-real. F-2-1 remains because its workbench is below the first mobile screen. |
| Claim registry and tagged tests | Implemented; six declared commands pass. F-2-2 through F-2-10 identify remaining unregistered claim copy. |
| 404, metadata, sitemap, skeleton | Fixed: missing paths return a designed HTTP 404; home/demo/legal/404 have titles, descriptions, canonicals, OG/Twitter image metadata, favicon, Apple touch icon, headers/footers, and sitemap entries; crawled links resolve. |
| Product-specific visual identity | Fixed and retained: the paper/archive neo-brutalist system matches `.factory/design.md` and is not a generic SaaS template. |
| Route focus | Home/demo focus their h1. Static legal and 404 routes do not, which is F-2-11. |

## Other structure checks

- All crawled internal, hash, legal, demo, 404, Sociobot checkout, and `sociobot.in` links returned HTTP 200 (or intended 404 for an invented path). Checkout resolves without embedded payment scripts.
- Home, demo, privacy, terms, and 404 have one h1, a `<main>`, route-appropriate title, meta description, canonical, OG/Twitter metadata, favicon, and consistent header/footer. The missing-path response is styled and returns HTTP 404.
- The landing has no console errors or 390px overflow. The fresh local axe test has no serious/critical violation. This does not replace static-route focus in F-2-11.
- The brief does not imply an additional AI, import/export, or sync capability beyond the existing local import, review, and ZIP export. The generated hero declares provenance; no runtime AI/provider key is embedded.

## What would make this perfect

Make the populated sample workbench the initial `/demo/` mobile screen, then either prove or remove every remaining visitor-facing capability, format, and payment assertion. Finish legal/404 route focus and announcements, and replace the README storage jargon with the plain safety statement. Re-run this full checklist from a fresh context; PASS requires zero findings.
