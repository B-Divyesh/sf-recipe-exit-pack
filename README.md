# Recipe Exit Pack

Convert recipe app exports into a recipe ZIP on your device. It is for people leaving a recipe app who want their recipe text, photos, notes, and source links in files they control.

Try the one-click sample at <https://recipe-exit-pack.sociobot.in/demo/>.

## What you get

- A recipe folder with a text file and a data file for every imported recipe
- A matched readable photo in its recipe folder
- A source list with supplied links, authors, notes, and imported filenames
- A place to review and edit recipes before download
- Offline use after the first successful visit

Recipe files are processed in the browser. The sample is stored separately on this device and never opens your real recipes.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Use `/demo/` to start with the shipped sample recipes.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

Run every command listed in [`.factory/claims.json`](.factory/claims.json) from a clean clone. The build creates the `dist/` folder for static hosting.

## Deploy

Deploy `dist/` to Azure Static Web Apps.

## Project notes

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and original image provenance: [`.factory/design.md`](.factory/design.md)
- Demo behavior: [`.factory/demo.md`](.factory/demo.md)
- Verification and handoff: [`.factory/handoff.md`](.factory/handoff.md)
- Privacy and terms: [/privacy/](/privacy/) and [/terms/](/terms/)

MIT licensed. Process only recipe content you are allowed to copy.
