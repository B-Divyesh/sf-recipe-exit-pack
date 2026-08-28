# Recipe Exit Pack — visual thesis

## Direction

**Neo-brutalist utility: the kitchen archive bench.** The interface should feel like a sturdy, labelled work surface where a messy app export is unpacked, inspected, and sealed into a portable archive. Heavy black rules, square corners, offset shadows, visible step numbers, and dense utility labels communicate agency and durability. A hand-made still life of a recipe card physically escaping a phone explains the product without pretending the tool scrapes sites.

This is deliberately single-mode. A warm paper ground keeps long-form recipe text readable, while ink-black structure and acid-lime actions create a clear, unusually recognizable working environment. It avoids the polished food-blog aesthetic: this is an exit tool, not another place to browse recipes.

## Tokens

- `paper` `#F3EFDF` — flour-dusted archival stock; page background.
- `sheet` `#FFFDF4` — clean recipe paper; working surfaces.
- `ink` `#171713` — marker-black; text and 3px structure.
- `muted` `#59584F` — pencil annotation; supporting copy (7.1:1 on paper).
- `lime` `#C8F04A` — fresh herb/highlighter; primary action, with ink text (13.1:1).
- `tomato` `#E84B32` — correction stamp; destructive/error state, with ink text where filled.
- `blue` `#3559E0` — export tape; links and focus, with white only at large type; normal link text uses `#2441B8`.
- `success` `#247A45`, `warning` `#8A5400`, `danger` `#A62A1D` — semantic text, always paired with an icon or words.

## Type

- Display and controls: `Arial Black`, `Arial Narrow Bold`, system sans-serif. Compressed, blunt labels resemble pantry stamps and keep the app dependency-free.
- Reading and recipe body: Georgia, Cambria, serif. This gives ingredients and notes the familiarity of a marked-up cookbook.
- Sizes follow a 1.25-ish scale: 14 utility, 16 body minimum, 20 subhead, 25 section title, 40–68 hero. Body leading is 1.55, measure 68ch. File counts use tabular figures.

No remote or bundled font files are required, keeping the font budget at 0 KB and making the archive bench available offline immediately.

## Spacing and layout

- Base unit: 4px; primary rhythm: 8 / 12 / 16 / 24 / 32 / 48 / 72.
- Max working width: 1180px. Desktop hero is a 7/5 split; the converter is a two-column workbench with a narrow queue and wide inspector.
- Borders are 2–3px ink, corners 0–4px, and primary surfaces cast a 6px hard shadow. Cards appear only for independent recipes or discrete workflow stages.
- At 390px, the illustration and secondary provenance line compress, every two-column region stacks, tabs scroll horizontally, and actions become full-width. No sticky action bars obscure safe areas.
- Targets are at least 44×44px with 8px separation.

## Interaction grammar

- **Bring in:** drop zone is an oversized dashed receiving tray. Drag-over changes its physical offset and label.
- **Check:** every imported recipe becomes a numbered docket. Selecting one moves a lime index marker and fills the inspector; fields remain directly editable.
- **Pack:** export is the only filled black action. During work it reports concrete phases, then turns into a download receipt with recipe and image counts.
- Pressed controls lose their offset shadow and move 2px, as though stamped. Errors use a tomato left rail plus corrective copy. Empty and offline states always name the next useful action.

## Motion

- 160ms for pressed/hover transform and focus; 220ms for inspector/notice opacity.
- No looping animation. Progress uses deterministic text and a non-animated fill. New queue items enter once with an 8px upward settle.
- Under `prefers-reduced-motion: reduce`, transitions and transforms are removed and scrolling is instant. Hierarchy remains through border, scale, and label changes.

## Asset plan and provenance

### Hero: “the recipe jailbreak still life”

An editorial paper-cut illustration: a tomato-red phone-shaped recipe app sits open like a rigid folder; a cream handwritten-looking (but text-free) recipe card, a small food photograph, herb-green tag, and blue source-link ribbon physically slide out into a black-edged archive box. Top-down, tactile paper fibers, hard offset shadows, limited paper/ink/lime/tomato/blue palette. The subject clarifies local export and preservation without showing third-party brands or unsupported scraping.

Prompt sheet:

> Use case: stylized-concept. Asset type: responsive landing-page hero illustration. Primary request: an editorial neo-brutalist paper-cut still life showing a personal recipe escaping a closed phone app into an owner-controlled archive. Scene/backdrop: warm off-white archival paper workbench. Subject: a tomato-red generic phone-shaped folder, cream recipe card with abstract ingredient marks, small food-photo tile, acid-lime tag, cobalt source-link ribbon, and black-edged archive box. Style/medium: tactile hand-cut paper collage with subtle fibers and block-print imperfections. Composition: landscape, objects centered, strong diagonal movement left to right, generous breathing room, readable at mobile crop. Lighting: direct studio light with crisp hard offset shadows. Palette: warm paper, near-black ink, acid lime, tomato red, cobalt blue. Constraints: original unbranded objects, no UI promises, no people. Avoid: text, letters, numbers, logos, watermark, gradients, glossy 3D, photoreal people, brand marks, generic SaaS dashboards.

- Generated on 2026-08-27 with the factory Azure image deployment via `/opt/fleet/lib/gen-image.sh` (original output, project-owned use).
- Candidate source and JSON prompt sidecar live in `assets/src/`; shipped WebP is optimized to ≤300 KB.
- Interface icons are hand-authored inline SVG using simple universal symbols; no third-party icon set.
- The footer discloses that the hero illustration was AI-generated for this product.

### Social preview

- `public/assets/recipe-exit-pack-social.jpg` is a 1200 × 630 crop for Open Graph and Twitter cards. It was generated on 2026-08-28 with the same factory Azure deployment and visual prompt sheet, then reviewed for text artifacts, brands, and unintended symbols. The source PNG and exact generation prompt are retained beside it as `recipe-exit-pack-social-source.png` and `.png.json`.
