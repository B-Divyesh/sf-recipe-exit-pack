import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildArchive, recipeMarkdown } from './exporter';
import type { Recipe } from './types';

const recipe: Recipe = {
  id: 'lemon-1', title: 'Lemon Pasta', ingredients: ['200 g pasta', '1 lemon'], steps: ['Boil.', 'Toss.'], notes: 'Weeknight favorite.',
  sourceUrl: 'https://example.com/lemon', attribution: 'Example Kitchen', tags: ['dinner'], originalFile: 'export.json', warnings: [],
  image: { name: 'photo.webp', mime: 'image/webp', extension: 'webp', bytes: new Uint8Array([1, 2, 3]), normalized: true }
};

describe('portable archive', () => {
  it('writes readable markdown with source information', () => {
    const markdown = recipeMarkdown(recipe, 'image.webp', true);
    expect(markdown).toContain('# Lemon Pasta');
    expect(markdown).toContain('![Lemon Pasta](image.webp)');
    expect(markdown).toContain('[Original source](https://example.com/lemon)');
    expect(markdown).toContain('Attribution: Example Kitchen');
  });

  it('creates recipe, metadata, image and manifest files', () => {
    const result = buildArchive([recipe], { archiveName: 'Family Recipes', includeYaml: true });
    const files = unzipSync(result.bytes);
    expect(result.fileName).toBe('family-recipes.zip');
    expect(Object.keys(files)).toContain('recipes/001-lemon-pasta/recipe.md');
    expect(Object.keys(files)).toContain('recipes/001-lemon-pasta/metadata.json');
    expect(Object.keys(files)).toContain('recipes/001-lemon-pasta/image.webp');
    expect(strFromU8(files['manifest/sources.md'])).toContain('https://example.com/lemon');
    expect(JSON.parse(strFromU8(files['manifest/recipes.json'])).format).toBe('recipe-exit-pack/1');
  });
});
