import { describe, expect, it } from 'vitest';
import { parseJson, parseRecipeText, slugify } from './parser';

describe('recipe parsing', () => {
  it('normalizes schema.org JSON-LD', () => {
    const [recipe] = parseJson(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Recipe', name: 'Lemon Pasta',
      recipeIngredient: ['200 g pasta', '1 lemon'],
      recipeInstructions: [{ '@type': 'HowToStep', text: 'Boil pasta.' }, { '@type': 'HowToStep', text: 'Add lemon.' }],
      url: 'https://example.com/lemon', author: { '@type': 'Person', name: 'Ada' }, keywords: 'quick, dinner'
    }));
    expect(recipe.title).toBe('Lemon Pasta');
    expect(recipe.ingredients).toEqual(['200 g pasta', '1 lemon']);
    expect(recipe.steps).toEqual(['Boil pasta.', 'Add lemon.']);
    expect(recipe.sourceUrl).toBe('https://example.com/lemon');
    expect(recipe.attribution).toBe('Ada');
    expect(recipe.tags).toEqual(['quick', 'dinner']);
  });

  it('normalizes Paprika-shaped JSON', () => {
    const [recipe] = parseJson(JSON.stringify({ name: 'Soup', ingredients: '1 onion\n2 carrots', directions: 'Chop.\nSimmer.', notes: 'Freeze half.', source_url: 'https://example.com/soup' }), 'soup.paprikarecipe');
    expect(recipe.ingredients).toHaveLength(2);
    expect(recipe.steps).toEqual(['Chop.', 'Simmer.']);
    expect(recipe.notes).toBe('Freeze half.');
    expect(recipe.originalFile).toBe('soup.paprikarecipe');
  });

  it('parses a readable pasted recipe and attribution', () => {
    const recipe = parseRecipeText(`# Flatbread\n\nIngredients\n- 2 cups flour\n- 1 cup water\n\nDirections\n1. Mix.\n2. Bake.\n\nNotes\nBest warm.\n\nSource: https://example.com/flatbread\nAuthor: Example Kitchen`);
    expect(recipe.title).toBe('Flatbread');
    expect(recipe.ingredients).toEqual(['2 cups flour', '1 cup water']);
    expect(recipe.steps).toEqual(['Mix.', 'Bake.']);
    expect(recipe.notes).toBe('Best warm.');
    expect(recipe.attribution).toBe('Example Kitchen');
  });

  it('makes stable, portable filename slugs', () => {
    expect(slugify('Crème brûlée / family!')).toBe('creme-brulee-family');
  });

  it('re-imports its own frontmatter Markdown cleanly', () => {
    const recipe = parseRecipeText(`---\ntitle: "Saved Soup"\nsource: "https://example.com/soup"\nattribution: "Family book"\ntags: [winter, lunch]\n---\n\n# Saved Soup\n\n## Ingredients\n\n- stock\n- noodles\n\n## Directions\n\n1. Simmer.\n\n## Notes\n\nKeep chilled.`);
    expect(recipe.title).toBe('Saved Soup');
    expect(recipe.ingredients).toEqual(['stock', 'noodles']);
    expect(recipe.sourceUrl).toBe('https://example.com/soup');
    expect(recipe.tags).toEqual(['winter', 'lunch']);
  });

  it('preserves all core fields in a 100-recipe export', () => {
    const input = Array.from({ length: 100 }, (_, index) => ({
      name: `Recipe ${index + 1}`,
      ingredients: [`${index + 1} cups ingredient`, 'salt'],
      directions: ['Mix.', `Cook for ${index + 1} minutes.`],
      notes: `Household note ${index + 1}`,
      source_url: `https://example.com/recipe-${index + 1}`
    }));
    const recipes = parseJson(JSON.stringify(input), 'hundred-recipes.json');
    expect(recipes).toHaveLength(100);
    expect(recipes.every((recipe) => recipe.title && recipe.ingredients.length === 2 && recipe.steps.length === 2 && recipe.notes && recipe.sourceUrl)).toBe(true);
  });
});
