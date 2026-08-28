# Adversarial first-read review 1 — Recipe Exit Pack

**Verdict: FAIL**

Reviewed 2026-08-28 against `https://recipe-exit-pack.sociobot.in` and commit `8072183c3321e9691c8fc374c8ce9e622e770d45`. This review made no product-code changes.

## Cold read

Fresh Chromium contexts at 390 × 844 and 1440 × 1000 loaded without console errors. Before scrolling, I can infer that this turns recipe exports or pasted recipes into a ZIP. The likely first click is **“Pack my recipes.”** I cannot identify the intended visitor plainly: **“Leave the app. Keep the recipes.”** and **“Local-only tool // Your recipes, released”** do not say “people leaving a recipe app” or explain that the visitor needs an export they own. **“Pack my recipes”** does not say that it opens file selection/pasting or offer a safe trial. This is a BLOCKING first-screen finding: what it does is inferable, but who it is for and the safe first action are not clear enough in 30 seconds.

## Findings (severity order)

### BLOCKING — No one-click demo and no isolated demo sandbox

**Quote/evidence:** The first screen has **“Pack my recipes”**, not **“Try it with sample data.”** `/demo` and `/?demo=1` each return the ordinary home page (HTTP 200; title **“Recipe Exit Pack — Take your recipes with you”**; h1 **“Leave the app. Keep the recipes.”**). Neither contains sample data, **“Demo — sample data, nothing is saved”**, **“Reset demo”**, or **“Start for real.”** There is no `.factory/demo.md`.

**Why:** Visitors without an export cannot see a reviewed recipe, source link, image, or downloaded result. They cannot verify that trying the product avoids their real data.

**Fix:** Put **“Try it with sample data”** on the first screen beside **“Choose recipe export.”** Add the explanation **“See three sample recipes ready to review and download.”** Make `/demo` immediately show realistic sample recipes, ingredients, notes, source URLs and archive preview. Keep a banner **“Demo — sample data, nothing is saved”** with working Reset demo and Start for real controls. Use a separate `demo:` storage namespace; do not read/write real storage in demo; clear demo data on exit. Add `.factory/demo.md` and tests for entry, reset, isolation, offline use, and intercepted network traffic.

### BLOCKING — `.factory/claims.json` and every required claim test are missing

**Quote/evidence:** `.factory/claims.json` does not exist. Therefore zero listed claim tests could be run from a clean clone and no test is tagged `@claim:<id>`.

**Why:** The visitor is asked to rely on privacy, offline, feature, price, and portability promises without an observable, repeatable proof in a demo sandbox.

**Fix:** Add `.factory/claims.json`. For each claim below, add exactly one `@claim:<id>` test that starts from `/demo`. Include an archive-content test, an offline-reload test, and a whole-flow network-interception test that permits only same-origin requests. Remove claims that cannot be tested.

Each quote below is an **individual unlisted-claim finding** until it has a registry entry and tagged test.

| Where | Unlisted claim(s) |
| --- | --- |
| Hero | “Turn exports and pasted recipes into a tidy ZIP of readable Markdown, JSON, viewable images, and source attribution.”; “Nothing leaves your browser.” |
| Hero facts | “No account”; “Works offline”; “No recipe uploads” |
| Converter | “Your browser does every step.”; “Supported: ZIP, Paprika, Mela, JSON/JSON-LD, HTML, Markdown, plain text, and common recipe images.” |
| Archive | “Every recipe gets its own folder.”; “Open the Markdown with any text editor.”; “No subscription or special viewer required.” |
| Archive | “Source URLs, authors, original filenames, and notes stay attached to the recipe.”; “Supported photos become compact WebP files.”; “Originals remain usable if conversion is unavailable.” |
| Paid/footer | “Import, edit, and export any number of recipes for free.”; the stated Plus features; “One-time purchase, no subscription”; “Move the license between devices”; “Core archive export is never locked”; “Secure checkout and refunds are handled by Sociobot / Dodo, the merchant of record.”; “No tracking.”; “No uploads.” |
| README introduction | “Recipe Exit Pack is a privacy-first browser utility for people leaving a recipe app.”; “It turns user-supplied exports and pasted recipes into a portable ZIP with human-readable Markdown, JSON metadata, normalized images, and a source/attribution manifest.” |
| README features | Every stated format/field/image capability; “Fully local parsing and archive generation; no recipe data is uploaded”; “Offline use after the first visit” |
| README paid/run/deploy | Unlimited free core flow, Plus feature/API claims, localhost conversion, described build output, and Sociobot/Dodo checkout claim |

### BLOCKING — `/demo` and a missing URL silently show the home page

**Quote/evidence:** `/demo`, `/?demo=1`, and `/not-a-real-route` all produce HTTP 200 with the home title and h1. There is no route-specific title, demo state, designed 404, focus transfer, or route announcement. `sitemap.xml` has no demo entry.

**Why:** The demo URL advertised to a catalog/verifier is not a demo. A mistyped shared link falsely appears to be a valid converter page.

**Fix:** Implement a real `/demo` with title **“Demo — Recipe Exit Pack”**, a demo h1, focus on navigation, back/forward support, and a sitemap entry. Return a designed, non-200 404 with a route-specific title/h1 and a home link. Test direct load, reload, back/forward, focus, and error routing.

### HIGH — The first screen uses metaphor instead of job, audience, and action

**Quote:** “Leave the app. Keep the recipes.” / “Your recipes, released” / “Pack my recipes.”

**Why:** “The app” could be any app, “released” has no concrete meaning, and “pack” conceals the next action. The user only learns the technical details from **“Turn exports and pasted recipes into a tidy ZIP of readable Markdown, JSON, viewable images, and source attribution.”**

**Fix:** Use **“Turn recipe app exports into a ZIP.”** Use **“For people leaving a recipe app who want recipes, photos, notes, and source links in files they control.”** Use **“Choose recipe export”** with **“Pick files or paste one recipe; then check and download your ZIP.”**

### HIGH — Jargon and shifting names obscure the result

**Quote:** The same output is called **“exit pack,” “tidy ZIP,” “portable archive,” “archive,”** and **“converter.”** Visible jargon includes **“Markdown,” “JSON,” “source attribution,” “normalized,” “YAML metadata,” “Obsidian-ready,” “Schema.org,” “Sociobot billing API,” “packing bench,” “Check the stack,”** and **“Recipe docket.”**

**Why:** A recipe owner does not need to know these implementation terms to decide whether the files solve their problem. Different output names suggest different things.

**Fix:** Define and consistently use **“recipe ZIP.”** Rename **“The packing bench”** to **“Convert your recipe export”**, **“Check the stack”** to **“Review imported recipes”**, and **“Recipe docket”** to **“Selected recipe.”** Explain the output as **“recipe text files, a data file for other tools, photos, and a source list.”**

### HIGH — Metadata, shared skeleton, and 404 are incomplete

**Evidence:** Home has `lang`, one h1, a description and SVG favicon, but lacks canonical, Open Graph, Twitter card, 1200×630 social image, and Apple touch icon. Privacy/Terms have titles and h1s but use different header/footer content. Their footer lacks Privacy/Terms, product one-liner, Param Factory credit and build ID; home header lacks Demo/Privacy. The home title has the required shape but **“Take your recipes with you”** is less plain than the conversion job.

**Why:** Shared links have incomplete previews; legal pages feel disconnected; no consistent way exists to reach privacy or the demo.

**Fix:** Add canonical, OG, Twitter and Apple-touch metadata using product art. Use one consistent header/footer on home, demo, legal and 404: wordmark, Demo, Privacy, skip link, one-liner, Privacy, Terms, **“Built by Param Factory”**, and build ID. Use **“Recipe Exit Pack — Convert recipe exports.”**

### MINOR — Specific copy flags and rewrites

No individual prose sentence exceeds 22 words after sentence boundaries are respected. The following are still distinct copy findings.

| Quote | Problem | Rewrite |
| --- | --- | --- |
| “Local-only tool // Your recipes, released” | Marketing/metaphor and jargon | “Your recipe files stay on this device.” |
| “Input stays here. The useful parts come out.” | Vague result | “Your files stay in this browser. You download the recipe ZIP.” |
| “The packing bench” | Heading lacks context | “Convert your recipe export” |
| “Build your exit pack” | Unexplained, inconsistent noun | “Create your recipe ZIP” |
| “Check the stack” / “Recipe docket” | Interface jargon | “Review imported recipes” / “Selected recipe” |
| “No mystery formats” | Heading lacks context | “What your recipe ZIP contains” |
| “An archive you can read in ten years.” | Untested durability implication | “Files you can open without this app” (test or remove) |
| “Images normalized” | Technical jargon | “Photos saved in a common format” |
| “Keep the essentials free” | Does not name free capability | “Import, edit, and download recipes for free” |
| “Obsidian-ready YAML metadata” | Technical jargon | “Notes-app fields” |
| “Pack my recipes” | Scroll-only action, not result naming | “Choose recipe export” |
| “Verify license” | Generic result | “Check my Archive Plus license” |
| README “privacy-first browser utility” | Untested adjective/generic noun | “A browser tool that converts recipe exports on your device.” |
| README “Schema.org recipe fields…” | Technical standard | “Common recipe titles, ingredients, directions, notes, and source links.” |
| README “resized and normalized to WebP” | Technical jargon | “Readable photos can be resized and saved as WebP files.” |
| README “Sociobot billing API” | Implementation jargon | “Archive Plus checks your license with Sociobot.” |

## Copy inventory

Counts include visible headings, labels, buttons and short states because they affect the first read. README code blocks/commands are excluded.

### Landing page

| Words | Copy |
| ---: | --- |
| 3 | Recipe Exit Pack |
| 1 / 3 / 2 | Convert / What you get / Archive Plus |
| 2 | Checking connection… |
| 5 | Local-only tool // Your recipes, released |
| 3 / 3 | Leave the app. / Keep the recipes. |
| 18 / 4 | Turn exports and pasted recipes into a tidy ZIP of readable Markdown, JSON, viewable images, and source attribution. / Nothing leaves your browser. |
| 3 / 4 | Pack my recipes / See the archive format |
| 2 / 2 / 3 | No account / Works offline / No recipe uploads |
| 4 / 5 | Input stays here. / The useful parts come out. |
| 3 / 4 | The packing bench / Build your exit pack |
| 4 / 5 | Import, check, and download. / Your browser does every step. |
| 3 / 2 / 2 | 1 Bring in / 2 Check / 3 Pack |
| 4 | Bring in your recipes |
| 10 | Choose files from an app export, or paste one recipe. |
| 13 | Supported: ZIP, Paprika, Mela, JSON/JSON-LD, HTML, Markdown, plain text, and common recipe images. |
| 4 / 3 | Drop your export here / or choose files |
| 4 / 4 | Paste one recipe instead / Recipe text or JSON |
| 10 | Headings such as Ingredients, Directions, Notes, and Source work best. |
| 3 | Add pasted recipe |
| 3 / 2 / 5 | Check the stack / Filter recipes / No recipes match that filter. |
| 2 / 2 | Recipe docket / Remove recipe |
| 1 / 4 / 5 | Title / Ingredients one per line / Directions one step per line |
| 2 / 2 / 2 | Your notes / Source URL / Author / attribution |
| 2 | Tags comma-separated |
| 3 / 2 / 10 / 2 | No matched image / Recipe image / Add an image if your export did not include one. / Choose image |
| 4 | Pack the portable archive |
| 10 | Your ZIP will include Markdown, JSON, images, and source attribution. |
| 2 / 4 / 3 / 4 | Archive name / Obsidian-ready YAML metadata Plus / Download exit pack / Building your archive locally… |
| 3 / 8 | No mystery formats / An archive you can read in ten years. |
| 6 / 12 / 7 | Every recipe gets its own folder. / Markdown is for people and notes apps; JSON is for future tools. / The source manifest keeps the trail intact. |
| 2 | MY-RECIPE-EXIT-PACK.ZIP |
| 1 / 7 / 6 | Human-readable / Open the Markdown with any text editor. / No subscription or special viewer required. |
| 2 / 12 | Attribution intact / Source URLs, authors, original filenames, and notes stay attached to the recipe. |
| 2 / 6 / 7 | Images normalized / Supported photos become compact WebP files. / Originals remain usable if conversion is unavailable. |
| 4 / 4 | Keep the essentials free / Archive Plus — $9 once |
| 10 | Import, edit, and export any number of recipes for free. |
| 18 | A one-time Plus license supports this local-first tool and adds workbench auto-resume, duplicate checks, and Obsidian-ready YAML metadata. |
| 4 / 5 / 6 | One-time purchase, no subscription / Move the license between devices / Core archive export is never locked |
| 2 / 5 / 5 / 2 / 2 | Free edition / Buy Archive Plus — $9 / Have a license? Restore it / License token / Verify license |
| 13 | Secure checkout and refunds are handled by Sociobot / Dodo, the merchant of record. |
| 2 / 2 | Terms / Privacy |
| 3 / 5 | Recipes are memories. / Keep them somewhere you control. |
| 2 / 2 | No tracking. / No uploads. |
| 8 / 4 | Hero illustration generated with AI for this product. / © 2026 Recipe Exit Pack. |
| 1 | Undo |

### README

| Words | Copy |
| ---: | --- |
| 3 | Recipe Exit Pack |
| 14 | Recipe Exit Pack is a privacy-first browser utility for people leaving a recipe app. |
| 22 | It turns user-supplied exports and pasted recipes into a portable ZIP with human-readable Markdown, JSON metadata, normalized images, and a source/attribution manifest. |
| 4 | https://recipe-exit-pack.sociobot.in |
| 3 | What it handles |
| 13 | ZIP, Mela (.melarecipes), Paprika (.paprikarecipes / .paprikarecipe), JSON, JSON-LD, HTML, Markdown, and plain-text input |
| 9 | Schema.org recipe fields plus common app-export field names |
| 18 | JPEG, PNG, WebP, GIF, AVIF, HEIC, and HEIF images; decodable still images are resized and normalized to WebP |
| 10 | Review and correction before export, with recipe removal and undo |
| 11 | Fully local parsing and archive generation; no recipe data is uploaded |
| 6 | Offline use after the first visit |
| 10 | The free edition allows unlimited core import, editing, and export. |
| 21 | The optional one-time Archive Plus license adds local workbench auto-resume, duplicate hints, and Obsidian-ready YAML metadata through the Sociobot billing API. |
| 2 / 6 | Run locally / Requires Node.js 20 or newer. |
| 6 | Open the local URL Vite prints. |
| 21 | To exercise license verification, the page must be hosted on an allowed Sociobot origin; the free conversion flow works on localhost. |
| 3 / 9 / 18 | Test and build / The exact production build command is npm run build. / It creates dist/ with dist/index.html, legal pages, the offline worker, and static deployment configuration at the root. |
| 1 / 10 / 19 | Deploy / Deploy the contents of dist/ to Azure Static Web Apps. / Do not deploy from the source directory and do not add payment-provider scripts; checkout is hosted by Sociobot / Dodo. |
| 2 | Project notes |
| 4 / 8 / 5 | Product brief: .factory/brief.json / Visual system and original image provenance: .factory/design.md / Verification and handoff: .factory/handoff.md |
| 9 | Privacy and terms are available at /privacy/ and /terms/. |
| 2 / 20 | MIT licensed. / Recipe content processed by the tool remains the user’s responsibility and is not covered by this repository’s license. |

## Checks that passed / did not block

- The 390px check has no horizontal overflow. The paper-cut archive illustration follows `.factory/design.md` and is product-specific, not a generic SaaS template.
- Fresh live mobile/desktop loads had no console errors. Home has one h1, `lang="en"`, `<main>`, a description, and meaningful hero alt text. The local axe check found no serious/critical issues.
- Crawl checks returned 200 for home, privacy, terms, robots, sitemap, hash destinations, and checkout (redirecting to Dodo).
- From a clean clone: `npm ci`, `npm test` (8 passed), and `npm run build` passed. After build, `npm run test:e2e` passed 9/9. These are general checks, not claim-test evidence.

## Acceptance retest

Use a fresh context to enter `/demo`, edit and reset its samples, confirm no non-demo storage changes, then test offline and intercepted requests. Run every new `.factory/claims.json` command from a clean clone. Recheck direct demo, missing route, metadata on all routes, and the first mobile screen. PASS requires zero blocking findings and no more than three minor findings.
