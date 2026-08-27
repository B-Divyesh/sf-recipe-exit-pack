# Recipe Exit Pack

Recipe Exit Pack is a privacy-first browser utility for people leaving a recipe app. It turns user-supplied exports and pasted recipes into a portable ZIP with human-readable Markdown, JSON metadata, normalized images, and a source/attribution manifest.

Live target: <https://recipe-exit-pack.sociobot.in>

## What it handles

- ZIP, Mela (`.melarecipes`), Paprika (`.paprikarecipes` / `.paprikarecipe`), JSON, JSON-LD, HTML, Markdown, and plain-text input
- Schema.org recipe fields plus common app-export field names
- JPEG, PNG, WebP, GIF, AVIF, HEIC, and HEIF images; decodable still images are resized and normalized to WebP
- Review and correction before export, with recipe removal and undo
- Fully local parsing and archive generation; no recipe data is uploaded
- Offline use after the first visit

The free edition allows unlimited core import, editing, and export. The optional one-time Archive Plus license adds local workbench auto-resume, duplicate hints, and Obsidian-ready YAML metadata through the Sociobot billing API.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL Vite prints. To exercise license verification, the page must be hosted on an allowed Sociobot origin; the free conversion flow works on localhost.

## Test and build

```sh
npm test
npm run build
npm run preview
```

The exact production build command is `npm run build`. It creates `dist/` with `dist/index.html`, legal pages, the offline worker, and static deployment configuration at the root.

## Deploy

Deploy the contents of `dist/` to Azure Static Web Apps. Do not deploy from the source directory and do not add payment-provider scripts; checkout is hosted by Sociobot / Dodo.

## Project notes

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and original image provenance: [`.factory/design.md`](.factory/design.md)
- Verification and handoff: [`.factory/handoff.md`](.factory/handoff.md)
- Privacy and terms are available at `/privacy/` and `/terms/`.

MIT licensed. Recipe content processed by the tool remains the user’s responsibility and is not covered by this repository’s license.
