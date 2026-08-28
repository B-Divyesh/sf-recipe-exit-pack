import type { Recipe } from './types';

const tinyPhoto = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='), (value) => value.charCodeAt(0));

export function sampleRecipes(): Recipe[] {
  return [
    {
      id: 'demo-lemon-pasta', title: 'Weeknight lemon pasta',
      ingredients: ['200 g spaghetti', '1 lemon', '35 g parmesan', '2 tbsp olive oil'],
      steps: ['Boil the spaghetti in salted water.', 'Toss with lemon zest, juice, oil, and parmesan.'],
      notes: 'A fast dinner from the old family folder.', sourceUrl: 'https://recipes.example.test/weeknight-lemon-pasta',
      attribution: 'Mara Lee', tags: ['weekday', 'pasta'], originalFile: 'mara-recipes.json', warnings: [],
      image: { name: 'lemon-pasta.png', mime: 'image/png', extension: 'png', bytes: tinyPhoto, normalized: false }
    },
    {
      id: 'demo-tomato-soup', title: 'Roasted tomato soup',
      ingredients: ['800 g tomatoes', '1 onion', '3 garlic cloves', '500 ml stock'],
      steps: ['Roast the tomatoes, onion, and garlic.', 'Blend with warm stock until smooth.'],
      notes: 'Keep the source link with the handwritten changes.', sourceUrl: 'https://recipes.example.test/roasted-tomato-soup',
      attribution: 'Hearth Table', tags: ['soup', 'freezer'], originalFile: 'saved-recipes.html', warnings: []
    },
    {
      id: 'demo-apple-crisp', title: 'Sunday apple crisp',
      ingredients: ['6 apples', '90 g oats', '70 g brown sugar', '60 g butter'],
      steps: ['Slice apples into a baking dish.', 'Cover with the oat topping and bake until golden.'],
      notes: 'Grandma’s note: use tart apples.', sourceUrl: 'https://recipes.example.test/sunday-apple-crisp',
      attribution: 'Nora Patel', tags: ['dessert', 'family'], originalFile: 'recipe-notes.md', warnings: []
    }
  ];
}
