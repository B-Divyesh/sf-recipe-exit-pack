# Copy audit

Checked 2026-09-05. Counts use words and numbers as tokens. Labels, file
names, navigation, field names, and build identifiers are excluded because
they are not sentences. No checked sentence exceeds 22 words or uses a banned
marketing term.

## Landing and demo copy

| Words | Location | Sentence |
| ---: | --- | --- |
| 7 | Hero heading | Turn recipe app exports into a ZIP. |
| 18 | Hero | For people leaving a recipe app who want recipes, photos, notes, and source links in files they control. |
| 9 | Sample action note | See three sample recipes ready to review and download. |
| 6 | Hero caption | Your files stay in this browser. |
| 5 | Hero caption | You download the recipe ZIP. |
| 6 | Converter | Choose files or paste one recipe. |
| 8 | Converter | Review the results, then download your recipe ZIP. |
| 8 | Import panel | Choose an app export or paste one recipe. |
| 9 | Import panel | ZIP, JSON, HTML, text, and recipe-image files work here. |
| 9 | Paste hint | Use headings for ingredients, directions, notes, and source links. |
| 14 | Recipe ZIP contents | The ZIP includes recipe text, a data file, photos, and a list of source links. |
| 6 | Recipe ZIP contents | Each recipe has its own folder. |
| 15 | Recipe text files | Each recipe folder includes a recipe text file you can open in a text editor. |
| 13 | Source list | Recipe source links, authors, notes, and imported filenames appear in the source list. |
| 8 | Photos included | Matched readable photos are included beside their recipe. |
| 7 | Footer | Convert recipe exports into files you control. |
| 8 | Footer | Hero illustration generated with AI for this product. |
| 7 | Demo banner | Changes stay in a separate sample workspace. |
| 6 | Empty filter | No recipes match that filter. |
| 10 | Image empty state | Add an image if your export did not include one. |
| 3 | Image status | Matched readable image. |
| 7 | Download progress | Building your recipe ZIP on this device. |
| 8 | Reset notice | Sample recipes reset. Nothing was saved to your real data. |
| 8 | Malformed image error | That image could not be decoded. Try JPEG, PNG, WebP, or a different HEIC export. |
| 13 | File error | Could not read those files. Try an unencrypted ZIP, JSON, Markdown, or text export. |
| 17 | Download receipt | Recipe ZIP downloaded: recipes and images. Keep the ZIP somewhere you control. |

The count table abbreviates dynamic numbers without changing the words shown to
the visitor. The short fact fragments **Recipe files stay on this device**,
**Recipe ZIP download stays free**, **Works offline after first visit**,
**No recipe uploads**, and **No tracking** are registered claims, not slogans.

## README copy

| Words | Location | Sentence or list item |
| ---: | --- | --- |
| 11 | Intro | Convert recipe app exports into a recipe ZIP on your device. |
| 20 | Intro | It is for people leaving a recipe app who want their recipe text, photos, notes, and source links in files they control. |
| 10 | Intro | Try the one-click sample at the demo URL. |
| 15 | What you get | A recipe folder with a text file and a data file for every imported recipe |
| 10 | What you get | A matched readable photo in its recipe folder |
| 11 | What you get | A source list with supplied links, authors, notes, and imported filenames |
| 10 | What you get | A place to review and edit recipes before download |
| 7 | What you get | Offline use after the first successful visit |
| 7 | Privacy | Recipe files are processed in the browser. |
| 14 | Privacy | The sample is stored separately on this device and never opens your real recipes. |
| 6 | Local run | Requires Node.js 20 or newer. |
| 7 | Local run | Open the local address printed by Vite. |
| 9 | Local run | Use the demo route to start with shipped sample recipes. |
| 12 | Test and build | Run every command listed in claims.json from a clean clone. |
| 11 | Test and build | The build creates the dist folder for static hosting. |
| 7 | Deploy | Deploy dist to Azure Static Web Apps. |
| 2 | Closing | MIT licensed. |
| 9 | Closing | Process only recipe content you are allowed to copy. |

## Terminology

| Concept | One term |
| --- | --- |
| Downloaded result | recipe ZIP |
| Imported content | recipe export |
| Example workspace | demo |
| List of source details | source list |
| Work area | workbench |

## Claim map

Every public outcome statement is listed in `.factory/claims.json`. The
browser suite uses the demo entry point to prove the recipe ZIP contents,
sample readiness, input formats, source fields, matched photos, review-before-
download flow, demo isolation, offline use, local-only processing, no tracking,
and free download.
