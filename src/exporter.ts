import { strToU8, zipSync } from 'fflate';
import type { ExportOptions, Recipe } from './types';
import { slugify } from './parser';

function safeYaml(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
}

export function recipeMarkdown(recipe: Recipe, imagePath?: string, includeYaml = true): string {
  const yaml = includeYaml ? [
    '---',
    `title: ${safeYaml(recipe.title)}`,
    `source: ${safeYaml(recipe.sourceUrl)}`,
    `attribution: ${safeYaml(recipe.attribution)}`,
    `tags: [${recipe.tags.map(safeYaml).join(', ')}]`,
    '---',
    ''
  ].join('\n') : '';
  const ingredients = recipe.ingredients.length ? recipe.ingredients.map((item) => `- ${item}`).join('\n') : '_No ingredients were present in the source export._';
  const steps = recipe.steps.length ? recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n') : '_No directions were present in the source export._';
  const notes = recipe.notes || '_No notes were present in the source export._';
  const source = recipe.sourceUrl ? `[Original source](${recipe.sourceUrl})` : 'No source URL was present in the supplied export.';
  const image = imagePath ? `![${recipe.title}](${imagePath})\n\n` : '';
  return `${yaml}# ${recipe.title}\n\n${image}## Ingredients\n\n${ingredients}\n\n## Directions\n\n${steps}\n\n## Notes\n\n${notes}\n\n## Source and attribution\n\n${source}${recipe.attribution ? `\n\nAttribution: ${recipe.attribution}` : ''}\n`;
}

export interface ArchiveResult { bytes: Uint8Array; fileName: string; imageCount: number }

export function buildArchive(recipes: Recipe[], options: ExportOptions): ArchiveResult {
  const files: Record<string, Uint8Array> = {};
  const used = new Map<string, number>();
  const metadata = recipes.map((recipe, index) => {
    const base = slugify(recipe.title);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    const folder = `recipes/${String(index + 1).padStart(3, '0')}-${base}${seen ? `-${seen + 1}` : ''}`;
    let imagePath: string | undefined;
    if (recipe.image) {
      imagePath = `image.${recipe.image.extension}`;
      files[`${folder}/${imagePath}`] = recipe.image.bytes;
    }
    files[`${folder}/recipe.md`] = strToU8(recipeMarkdown(recipe, imagePath, options.includeYaml));
    const record = { ...recipe, image: recipe.image ? { file: imagePath, mime: recipe.image.mime, normalized: recipe.image.normalized } : null, imageHints: undefined };
    files[`${folder}/metadata.json`] = strToU8(JSON.stringify(record, null, 2));
    return { ...record, folder };
  });
  const sourceLines = ['# Source and attribution manifest', '', 'Generated locally by Recipe Exit Pack. Source details are preserved as supplied; verify them before redistribution.', ''];
  for (const recipe of recipes) {
    sourceLines.push(`## ${recipe.title}`, '', recipe.sourceUrl ? `- Source URL: ${recipe.sourceUrl}` : '- Source URL: not present', recipe.attribution ? `- Attribution: ${recipe.attribution}` : '- Attribution: not present', `- Imported from: ${recipe.originalFile}`, '');
  }
  files['manifest/sources.md'] = strToU8(sourceLines.join('\n'));
  files['manifest/recipes.json'] = strToU8(JSON.stringify({ format: 'recipe-exit-pack/1', exportedAt: new Date().toISOString(), recipes: metadata }, null, 2));
  files['README.txt'] = strToU8(`RECIPE EXIT PACK\n\nThis archive contains ${recipes.length} human-readable recipe folder${recipes.length === 1 ? '' : 's'}.\nEach folder has recipe.md, metadata.json, and its matched image when available.\nThe manifest folder preserves source links and attribution.\n\nEverything was created in your browser; no recipe content was uploaded.\n`);
  const archiveBase = slugify(options.archiveName || 'my-recipe-exit-pack');
  return { bytes: zipSync(files, { level: 6 }), fileName: `${archiveBase}.zip`, imageCount: recipes.filter((recipe) => recipe.image).length };
}
