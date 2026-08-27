import { gunzipSync, unzipSync } from 'fflate';
import type { ParseResult, Recipe, RecipeImage } from './types';

const decoder = new TextDecoder();
const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif']);
const textExtensions = new Set(['json', 'jsonld', 'md', 'markdown', 'txt', 'recipe', 'html', 'htm']);

export function makeId(seed = ''): string {
  const random = crypto.getRandomValues(new Uint32Array(2));
  return `${slugify(seed || 'recipe')}-${random[0].toString(36)}${random[1].toString(36)}`;
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || 'untitled-recipe';
}

function lines(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(lines).filter(Boolean);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const direct = text(record.text ?? record.original ?? record.description);
    if (direct) return lines(direct);
    const name = text(record.name ?? record.ingredient);
    if (name) return [`${text(record.quantity ?? record.amount)} ${text(record.unit)} ${name}`.replace(/\s+/g, ' ').trim()];
  }
  if (typeof value !== 'string') return [];
  return value.split(/\r?\n/).map((part) => part.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
}

function text(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('\n');
  return '';
}

function sourceFrom(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return text(record.url ?? record['@id'] ?? record.name);
  }
  return '';
}

function unwrapJson(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(unwrapJson);
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  if (Array.isArray(record['@graph'])) return unwrapJson(record['@graph']);
  for (const key of ['recipes', 'items', 'data']) {
    if (Array.isArray(record[key])) return unwrapJson(record[key]);
  }
  return [record];
}

function parseJsonRecord(value: unknown, originalFile: string): Recipe | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const type = text(item['@type']).toLowerCase();
  const title = text(item.name ?? item.title ?? item.recipe_name);
  const ingredients = lines(item.recipeIngredient ?? item.ingredients ?? item.ingredientLines);
  const rawInstructions = item.recipeInstructions ?? item.instructions ?? item.directions ?? item.steps;
  let steps: string[] = [];
  if (Array.isArray(rawInstructions)) {
    steps = rawInstructions.flatMap((entry) => {
      if (entry && typeof entry === 'object') {
        const row = entry as Record<string, unknown>;
        if (Array.isArray(row.itemListElement)) return row.itemListElement.flatMap((child) => text((child as Record<string, unknown>)?.text));
        return lines(row.text ?? row.name);
      }
      return lines(entry);
    }).filter(Boolean);
  } else steps = lines(rawInstructions);
  if (!title && !ingredients.length && !steps.length) return null;
  if (type && !type.includes('recipe') && !ingredients.length && !steps.length) return null;

  const imageValue = item.image ?? item.images ?? item.photo ?? item.photo_url ?? item.photo_filename;
  const imageHints = Array.isArray(imageValue)
    ? imageValue.map((entry) => sourceFrom(entry)).filter(Boolean)
    : [sourceFrom(imageValue)].filter(Boolean);
  const tags = lines(item.keywords ?? item.tags ?? item.categories).flatMap((tag) => tag.split(',')).map((tag) => tag.trim()).filter(Boolean);
  const sourceUrl = sourceFrom(item.url ?? item.source_url ?? item.sourceUrl ?? item.original_url);
  return {
    id: text(item.uid ?? item.id) || makeId(title),
    title: title || 'Untitled recipe',
    ingredients,
    steps,
    notes: text(item.notes ?? item.note ?? item.description),
    sourceUrl,
    attribution: sourceFrom(item.author ?? item.source ?? item.attribution),
    tags,
    originalFile,
    warnings: [],
    imageHints
  };
}

export function parseJson(input: string, originalFile = 'pasted.json'): Recipe[] {
  const parsed: unknown = JSON.parse(input.replace(/^\uFEFF/, ''));
  return unwrapJson(parsed).map((value) => parseJsonRecord(value, originalFile)).filter((value): value is Recipe => Boolean(value));
}

function headingName(line: string): string {
  return line.toLowerCase().replace(/^#+\s*/, '').replace(/[:：]\s*$/, '').trim();
}

export function parseRecipeText(input: string, originalFile = 'pasted-text.txt'): Recipe {
  let cleanedInput = input.replace(/^\uFEFF/, '');
  const yaml: Record<string, string> = {};
  if (cleanedInput.startsWith('---')) {
    const end = cleanedInput.indexOf('\n---', 3);
    if (end > 0) {
      for (const row of cleanedInput.slice(3, end).split(/\r?\n/)) {
        const match = row.match(/^([\w-]+):\s*["']?(.*?)["']?\s*$/);
        if (match) yaml[match[1].toLowerCase()] = match[2];
      }
      cleanedInput = cleanedInput.slice(end + 4);
    }
  }
  const rawLines = cleanedInput.split(/\r?\n/);
  const nonEmpty = rawLines.map((line) => line.trim()).filter(Boolean);
  const titleLine = nonEmpty.find((line) => /^#\s+/.test(line)) ?? nonEmpty[0];
  const title = yaml.title || titleLine?.replace(/^#\s*/, '') || 'Untitled recipe';
  const ingredients: string[] = [];
  const steps: string[] = [];
  const notes: string[] = [];
  const tags: string[] = [];
  let sourceUrl = yaml.source || yaml.url || '';
  let attribution = yaml.attribution || yaml.author || '';
  let section: 'ingredients' | 'steps' | 'notes' | 'meta' = 'meta';
  let titleConsumed = false;

  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line) continue;
    if (!titleConsumed && (line === titleLine || line.replace(/^#\s*/, '') === title)) { titleConsumed = true; continue; }
    const heading = headingName(line);
    if (/^(ingredients?|what you need)$/.test(heading)) { section = 'ingredients'; continue; }
    if (/^(instructions?|directions?|method|steps?)$/.test(heading)) { section = 'steps'; continue; }
    if (/^(notes?|tips?)$/.test(heading)) { section = 'notes'; continue; }
    const sourceMatch = line.match(/^(?:source|source url|url)\s*:\s*(https?:\/\/\S+)/i);
    if (sourceMatch) { sourceUrl = sourceMatch[1]; continue; }
    const attributionMatch = line.match(/^(?:author|attribution|by)\s*:\s*(.+)$/i);
    if (attributionMatch) { attribution = attributionMatch[1].trim(); continue; }
    const tagMatch = line.match(/^tags?\s*:\s*(.+)$/i);
    if (tagMatch) { tags.push(...tagMatch[1].split(',').map((tag) => tag.trim()).filter(Boolean)); continue; }
    const clean = line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim();
    if (section === 'ingredients') ingredients.push(clean);
    else if (section === 'steps') steps.push(clean);
    else if (section === 'notes') notes.push(clean);
    else if (/^https?:\/\//i.test(line) && !sourceUrl) sourceUrl = line;
  }

  if (!ingredients.length && !steps.length) {
    const body = nonEmpty.slice(1);
    const splitAt = body.findIndex((line) => /^\d+[.)]\s+/.test(line));
    if (splitAt >= 0) {
      ingredients.push(...body.slice(0, splitAt).map((line) => line.replace(/^[-*•]\s*/, '')));
      steps.push(...body.slice(splitAt).map((line) => line.replace(/^\d+[.)]\s*/, '')));
    } else notes.push(...body);
  }

  if (yaml.tags) tags.push(...yaml.tags.replace(/^\[|\]$/g, '').split(',').map((tag) => tag.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean));
  return { id: makeId(title), title, ingredients, steps, notes: notes.join('\n'), sourceUrl, attribution, tags, originalFile, warnings: [] };
}

function parseHtml(input: string, originalFile: string): Recipe[] {
  const document = new DOMParser().parseFromString(input, 'text/html');
  const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  const recipes = jsonLd.flatMap((script) => {
    try { return parseJson(script.textContent || '', originalFile); }
    catch { return []; }
  });
  if (recipes.length) return recipes;
  const title = document.querySelector('h1')?.textContent?.trim() || document.title || 'Untitled recipe';
  return [parseRecipeText(`${title}\n\n${document.body.textContent || ''}`, originalFile)];
}

function ext(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function mimeFor(extension: string): string {
  return extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension === 'heic' ? 'heic' : extension}`;
}

function decodeBase64Image(value: unknown, fallbackName: string): RecipeImage | undefined {
  if (typeof value !== 'string' || value.length < 100) return undefined;
  const match = value.match(/^data:(image\/[\w.+-]+);base64,(.+)$/s);
  const encoded = match?.[2] ?? (/^[A-Za-z0-9+/=\s]+$/.test(value) ? value.replace(/\s/g, '') : '');
  if (!encoded) return undefined;
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const mime = match?.[1] ?? 'image/jpeg';
    const extension = mime.split('/')[1].replace('jpeg', 'jpg');
    return { name: `${fallbackName}.${extension}`, mime, extension, bytes, normalized: false };
  } catch { return undefined; }
}

function extractEmbeddedImage(input: string, recipe: Recipe): RecipeImage | undefined {
  try {
    const parsed = JSON.parse(input) as Record<string, unknown>;
    const row = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!row || typeof row !== 'object') return undefined;
    for (const key of ['photo_data', 'image_data', 'imageData', 'photo']) {
      const image = decodeBase64Image((row as Record<string, unknown>)[key], slugify(recipe.title));
      if (image) return image;
    }
  } catch { /* no embedded image */ }
  return undefined;
}

interface VirtualFile { name: string; bytes: Uint8Array }

function expandArchive(file: VirtualFile, warnings: string[]): VirtualFile[] {
  const extension = ext(file.name);
  try {
    if (extension === 'zip' || extension === 'melarecipes' || extension === 'paprikarecipes') {
      const entries = unzipSync(file.bytes);
      return Object.entries(entries)
        .filter(([name]) => !name.endsWith('/') && !name.includes('__MACOSX'))
        .flatMap(([name, bytes]) => expandArchive({ name, bytes }, warnings));
    }
    if (extension === 'paprikarecipe' || extension === 'gz' || (file.bytes[0] === 0x1f && file.bytes[1] === 0x8b)) {
      return [{ name: file.name.replace(/\.(?:paprikarecipe|gz)$/i, '.json'), bytes: gunzipSync(file.bytes) }];
    }
  } catch (error) {
    warnings.push(`Could not unpack ${file.name}: ${error instanceof Error ? error.message : 'unknown archive error'}`);
    return [];
  }
  return [file];
}

function imageScore(recipe: Recipe, imageName: string): number {
  const imagePath = imageName.toLowerCase();
  const imageBase = slugify(imageName.replace(/\.[^.]+$/, '').split('/').pop() || '');
  const titleSlug = slugify(recipe.title);
  let score = 0;
  if (recipe.imageHints?.some((hint) => imagePath.endsWith(hint.toLowerCase().split('/').pop() || ''))) score += 100;
  if (imageBase && titleSlug.includes(imageBase)) score += 30;
  if (titleSlug && imageBase.includes(titleSlug)) score += 30;
  const imageDir = imagePath.split('/').slice(0, -1).join('/');
  const recipeDir = recipe.originalFile.toLowerCase().split('/').slice(0, -1).join('/');
  if (imageDir && imageDir === recipeDir) score += 20;
  if (imagePath.includes(recipe.id.toLowerCase())) score += 40;
  return score;
}

export async function parseFiles(files: File[]): Promise<ParseResult> {
  const warnings: string[] = [];
  const virtual: VirtualFile[] = [];
  for (const file of files) virtual.push(...expandArchive({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }, warnings));
  const recipes: Recipe[] = [];
  const images: RecipeImage[] = [];

  for (const file of virtual) {
    const extension = ext(file.name);
    if (imageExtensions.has(extension)) {
      images.push({ name: file.name, mime: mimeFor(extension), extension: extension.replace('jpeg', 'jpg'), bytes: file.bytes, normalized: false });
      continue;
    }
    if (!textExtensions.has(extension)) continue;
    const content = decoder.decode(file.bytes);
    try {
      const parsed = extension === 'json' || extension === 'jsonld' ? parseJson(content, file.name) : extension === 'html' || extension === 'htm' ? parseHtml(content, file.name) : [parseRecipeText(content, file.name)];
      for (const recipe of parsed) {
        recipe.image = extractEmbeddedImage(content, recipe);
        recipes.push(recipe);
      }
    } catch (error) {
      warnings.push(`Skipped ${file.name}: ${error instanceof Error ? error.message : 'unreadable recipe data'}`);
    }
  }

  const unused = [...images];
  for (const recipe of recipes.filter((item) => !item.image)) {
    const ranked = unused.map((image, index) => ({ image, index, score: imageScore(recipe, image.name) })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (best && (best.score > 0 || (recipes.length === 1 && unused.length === 1))) {
      recipe.image = best.image;
      unused.splice(best.index, 1);
    }
  }
  if (unused.length) warnings.push(`${unused.length} image${unused.length === 1 ? '' : 's'} could not be matched to a recipe.`);
  if (!recipes.length && virtual.length) warnings.push('No recipes were recognized. Try JSON, Markdown, plain text, or a ZIP containing those files.');
  return { recipes, warnings, filesRead: virtual.length };
}
